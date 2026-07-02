import { Client } from "./Client";
import { Color } from "./Color";
import { Optional } from "./Optional";
import { Wheels } from "./Wheels";

export interface Order {
  number: string;
  status: string;
  model: string;
  color: Color['name'];
  interior: string;
  wheels: Wheels['name'];
  store?: string;
  customer: Client;
  optionals?: Array<Optional['name']>;
}