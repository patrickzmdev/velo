import type { Insertable } from 'kysely';
import { getDb } from './db';
import type { OrdersTable } from './schema';

type OrderSeed = Insertable<OrdersTable>;

/**
 * Pedidos que os testes de consulta dependem, cada um no seu devido status.
 * Os order_number e valores espelham as fixtures em support/fixtures/orders.ts.
 */
export const seedOrders: OrderSeed[] = [
  {
    order_number: 'VLO-ULGOAW',
    color: 'glacier-blue',
    wheel_type: 'aero',
    customer_name: 'Patrick Zanela',
    customer_email: 'teste@teste.com',
    customer_phone: '(11) 11111-1111',
    customer_cpf: '000.000.141-41',
    payment_method: 'avista',
    total_price: 40000,
    status: 'APROVADO',
    optionals: [],
    created_at: '2026-05-15 23:35:29.89511+00',
    updated_at: '2026-05-15 23:35:29.89511+00',
  },
  {
    order_number: 'VLO-2PP21D',
    color: 'lunar-white',
    wheel_type: 'sport',
    customer_name: 'Joao Pedro',
    customer_email: 'teste2@teste.com',
    customer_phone: '(43) 12131-2412',
    customer_cpf: '690.936.410-42',
    payment_method: 'avista',
    total_price: 52500,
    status: 'REPROVADO',
    optionals: ['flux-capacitor', 'precision-park'],
    created_at: '2026-06-01 23:52:09.922377+00',
    updated_at: '2026-06-01 23:54:56.067442+00',
  },
  {
    order_number: 'VLO-D6HPCX',
    color: 'midnight-black',
    wheel_type: 'aero',
    customer_name: 'Marcio Rosa',
    customer_email: 'teste3@teste.com',
    customer_phone: '(31) 23124-1231',
    customer_cpf: '512.674.800-92',
    payment_method: 'avista',
    total_price: 40000,
    status: 'EM_ANALISE',
    optionals: [],
    created_at: '2026-06-02 00:47:49.44983+00',
    updated_at: '2026-06-02 00:48:27.117852+00',
  },
];

/**
 * Insere (ou atualiza) os pedidos de teste, garantindo que cada um exista
 * no seu devido status. Idempotente via ON CONFLICT (order_number).
 */
export async function seedTestOrders(orders: OrderSeed[] = seedOrders): Promise<void> {
  const db = getDb();

  await db
    .insertInto('orders')
    .values(orders)
    .onConflict((oc) =>
      oc.column('order_number').doUpdateSet({
        color: (eb) => eb.ref('excluded.color'),
        wheel_type: (eb) => eb.ref('excluded.wheel_type'),
        customer_name: (eb) => eb.ref('excluded.customer_name'),
        customer_email: (eb) => eb.ref('excluded.customer_email'),
        customer_phone: (eb) => eb.ref('excluded.customer_phone'),
        customer_cpf: (eb) => eb.ref('excluded.customer_cpf'),
        payment_method: (eb) => eb.ref('excluded.payment_method'),
        total_price: (eb) => eb.ref('excluded.total_price'),
        status: (eb) => eb.ref('excluded.status'),
        optionals: (eb) => eb.ref('excluded.optionals'),
        created_at: (eb) => eb.ref('excluded.created_at'),
        updated_at: (eb) => eb.ref('excluded.updated_at'),
      }),
    )
    .execute();
}

/**
 * Remove os pedidos de teste pelo order_number. Útil para teardown.
 */
export async function cleanupTestOrders(orders: OrderSeed[] = seedOrders): Promise<void> {
  const db = getDb();
  await db
    .deleteFrom('orders')
    .where(
      'order_number',
      'in',
      orders.map((o) => o.order_number),
    )
    .execute();
}

/** 
 * Remove os pedidos de teste de um determinado cpf
 */
export async function cleanupTestOrdersByCpf(cpf: string): Promise<void> {
  const db = getDb();
  await db
    .deleteFrom('orders')
    .where('customer_cpf', '=', cpf)
    .execute();
}
