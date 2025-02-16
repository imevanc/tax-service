import { SaleAmendment, Transaction } from "../types";

export class TaxCalculatorService {
  static calculate(
    transactions: Array<Transaction>,
    amendments: Array<SaleAmendment>,
  ): number {
    const amendmentMap = new Map<string, Map<string, SaleAmendment>>();

    for (const amendment of amendments) {
      const key = amendment.invoiceId;
      if (!amendmentMap.has(key)) {
        amendmentMap.set(key, new Map());
      }
      amendmentMap.get(key)!.set(amendment.itemId, amendment);
    }

    let totalTax = 0;

    for (const transaction of transactions) {
      if (transaction.eventType === "SALES") {
        for (const item of transaction.items) {
          if (item.cost < 0 || item.taxRate < 0 || item.taxRate > 1) {
            throw new Error(`Invalid cost or tax rate for item ${item.itemId}`);
          }
          const invoiceAmendments = amendmentMap.get(transaction.invoiceId);
          if (invoiceAmendments && invoiceAmendments.has(item.itemId)) {
            const amendment = invoiceAmendments.get(item.itemId)!;
            totalTax += amendment.cost * amendment.taxRate;
          } else {
            totalTax += item.cost * item.taxRate;
          }
        }
      } else if (transaction.eventType === "TAX_PAYMENT") {
        if (transaction.amount < 0) {
          throw new Error("Invalid tax payment amount");
        }
        totalTax -= transaction.amount;
      }
    }

    return Math.round(totalTax);
  }
}
