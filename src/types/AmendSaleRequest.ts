export type AmendSaleRequest = {
  date: string;
  invoiceId: string;
  itemId: string;
  cost: number;
  taxRate: number;
};
