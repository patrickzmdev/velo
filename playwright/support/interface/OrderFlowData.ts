import { CheckoutPersonalData } from './CheckoutPersonalData';
import { Color } from './Color';
import { Wheels } from './Wheels';

export interface OrderFlowData extends CheckoutPersonalData {
  value: string;
  color: Color['name'];
  wheels: Wheels['name'];
}
