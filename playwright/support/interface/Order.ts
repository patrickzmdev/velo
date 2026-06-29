import { Client } from "./Client";

export interface Order {
  number: string;
  status: string;
  model: string;
  color: string;
  interior: string;
  wheels: string;
  store?: string;
  customer: Client;
}