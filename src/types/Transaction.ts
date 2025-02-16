import { TaxPaymentEvent } from "./TaxPaymentEvent";
import { SaleEvent } from "./SaleEvent";

export type Transaction = SaleEvent | TaxPaymentEvent;
