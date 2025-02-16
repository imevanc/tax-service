import { ItemData } from "./ItemData";

export type SaleEvent = {
  eventType: "SALES";
  date: string;
  invoiceId: string;
  items: Array<ItemData>;
};
