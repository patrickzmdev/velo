export interface CheckoutPersonalData {
  name: string;
  surname: string;
  email: string;
  phone: string;
  cpf: string;
  store: string;
  paymentMethod: 'avista' | 'financiamento';
}