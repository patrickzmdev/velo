import { beforeEach, describe, expect, it } from 'vitest';
import {
  calculateInstallment,
  calculateTotalPrice,
  formatPrice,
  useConfiguratorStore,
  type CarConfiguration,
  type Order,
} from './configuratorStore';

const baseConfig: CarConfiguration = {
  exteriorColor: 'glacier-blue',
  interiorColor: 'carbon-black',
  wheelType: 'aero',
  optionals: [],
};

const makeOrder = (email: string): Order => ({
  id: 'order-1',
  configuration: baseConfig,
  totalPrice: 40000,
  customer: {
    name: 'Ana',
    surname: 'Silva',
    email,
    phone: '11999999999',
    cpf: '12345678900',
    store: 'SP',
  },
  paymentMethod: 'avista',
  status: 'APROVADO',
  createdAt: '2026-07-24T00:00:00.000Z',
});

// The store is a persisted singleton, so reset it to a known state before each test.
beforeEach(() => {
  useConfiguratorStore.setState({
    configuration: { ...baseConfig },
    viewMode: 'exterior',
    orders: [],
    currentUserEmail: null,
  });
});

describe('configuratorStore pure functions', () => {
  describe('calculateTotalPrice', () => {
    it('should calculate base price with aero wheels and no optionals', () => {
      expect(calculateTotalPrice(baseConfig)).toBe(40000);
    });

    it('should add sport wheels price correctly', () => {
      expect(calculateTotalPrice({ ...baseConfig, wheelType: 'sport' })).toBe(42000);
    });

    it('should add optionals price correctly', () => {
      const total = calculateTotalPrice({
        ...baseConfig,
        optionals: ['precision-park', 'flux-capacitor'],
      });
      expect(total).toBe(40000 + 5500 + 5000); // Base + Precision Park + Flux Capacitor
    });

    it('should ignore invalid optionals', () => {
      const total = calculateTotalPrice({
        ...baseConfig,
        optionals: ['not-a-real-option'] as unknown as CarConfiguration['optionals'],
      });
      expect(total).toBe(40000);
    });
  });

  describe('calculateInstallment', () => {
    it('should calculate 12x installment with 2% monthly interest correctly', () => {
      // (40000 * 0.02 * 1.02^12) / (1.02^12 - 1) -> rounded to 3782.38
      expect(calculateInstallment(40000)).toBe(3782.38);
    });
  });

  describe('formatPrice', () => {
    it('should format numbers to BRL currency string', () => {
      // eslint-disable-next-line no-irregular-whitespace
      const formatted = formatPrice(40000).replace(/ /g, ' ');
      expect(formatted).toContain('R$');
      expect(formatted).toContain('40.000,00');
    });
  });
});

describe('configuratorStore configuration actions', () => {
  it('setExteriorColor updates the color and switches to exterior view', () => {
    useConfiguratorStore.setState({ viewMode: 'interior' });
    useConfiguratorStore.getState().setExteriorColor('lunar-white');
    const state = useConfiguratorStore.getState();
    expect(state.configuration.exteriorColor).toBe('lunar-white');
    expect(state.viewMode).toBe('exterior');
  });

  it('setInteriorColor updates the color and switches to interior view', () => {
    useConfiguratorStore.getState().setInteriorColor('deep-blue');
    const state = useConfiguratorStore.getState();
    expect(state.configuration.interiorColor).toBe('deep-blue');
    expect(state.viewMode).toBe('interior');
  });

  it('setWheelType updates the wheel type', () => {
    useConfiguratorStore.getState().setWheelType('sport');
    expect(useConfiguratorStore.getState().configuration.wheelType).toBe('sport');
  });

  it('setViewMode updates the view mode', () => {
    useConfiguratorStore.getState().setViewMode('interior');
    expect(useConfiguratorStore.getState().viewMode).toBe('interior');
  });

  it('toggleOptional adds an optional when absent and removes it when present', () => {
    const { toggleOptional } = useConfiguratorStore.getState();

    toggleOptional('precision-park');
    expect(useConfiguratorStore.getState().configuration.optionals).toContain('precision-park');

    toggleOptional('precision-park');
    expect(useConfiguratorStore.getState().configuration.optionals).not.toContain('precision-park');
  });

  it('resetConfiguration restores the default configuration', () => {
    useConfiguratorStore.setState({
      configuration: {
        exteriorColor: 'midnight-black',
        interiorColor: 'deep-blue',
        wheelType: 'sport',
        optionals: ['precision-park'],
      },
    });

    useConfiguratorStore.getState().resetConfiguration();
    expect(useConfiguratorStore.getState().configuration).toEqual(baseConfig);
  });
});

describe('configuratorStore orders and auth', () => {
  it('addOrder appends the order to the list', () => {
    const order = makeOrder('user@example.com');
    useConfiguratorStore.getState().addOrder(order);
    expect(useConfiguratorStore.getState().orders).toEqual([order]);
  });

  it('login returns true and sets the current user when an order exists', () => {
    useConfiguratorStore.getState().addOrder(makeOrder('test@example.com'));
    const result = useConfiguratorStore.getState().login('test@example.com');
    expect(result).toBe(true);
    expect(useConfiguratorStore.getState().currentUserEmail).toBe('test@example.com');
  });

  it('login returns false and does not set the user without a matching order', () => {
    const result = useConfiguratorStore.getState().login('nobody@example.com');
    expect(result).toBe(false);
    expect(useConfiguratorStore.getState().currentUserEmail).toBeNull();
  });

  it('logout clears the current user', () => {
    useConfiguratorStore.setState({ currentUserEmail: 'test@example.com' });
    useConfiguratorStore.getState().logout();
    expect(useConfiguratorStore.getState().currentUserEmail).toBeNull();
  });

  it('getUserOrders returns only the logged-in user orders', () => {
    const { addOrder } = useConfiguratorStore.getState();
    addOrder(makeOrder('user@example.com'));
    addOrder({ ...makeOrder('other@example.com'), id: 'order-2' });

    useConfiguratorStore.setState({ currentUserEmail: 'user@example.com' });
    const orders = useConfiguratorStore.getState().getUserOrders();
    expect(orders).toHaveLength(1);
    expect(orders[0].customer.email).toBe('user@example.com');
  });

  it('getUserOrders returns an empty list when nobody is logged in', () => {
    useConfiguratorStore.getState().addOrder(makeOrder('user@example.com'));
    expect(useConfiguratorStore.getState().getUserOrders()).toEqual([]);
  });
});
