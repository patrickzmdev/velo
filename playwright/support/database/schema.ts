import { Generated, ColumnType } from 'kysely';

/**
 * Tipagem da tabela public.orders do Supabase, usada pelo Kysely.
 * Reflete o schema atual após as migrations (color, sem interior_color, com optionals[]).
 */
export interface OrdersTable {
  id: Generated<string>;
  order_number: string;
  color: string;
  wheel_type: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_cpf: string;
  payment_method: string;
  total_price: number;
  status: string;
  optionals: string[];
  created_at: ColumnType<Date, string | Date | undefined, string | Date>;
  updated_at: ColumnType<Date, string | Date | undefined, string | Date>;
}

export interface Database {
  orders: OrdersTable;
}
