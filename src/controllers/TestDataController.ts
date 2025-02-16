import { Request, Response } from "express";
import { SaleAmendment, Transaction } from "../types";
import { AmendmentModel, TransactionModel } from "../models";
import { logger } from "../utils";

export class TestDataController {
  static async generateTestData(req: Request, res: Response): Promise<void> {
    try {
      const salesEvents: Array<Transaction> = [
        {
          eventType: "SALES",
          date: "2023-01-15T12:00:00Z",
          invoiceId: "INV-001",
          items: [
            { itemId: "ITEM-001", cost: 1000, taxRate: 0.2 },
            { itemId: "ITEM-002", cost: 500, taxRate: 0.1 },
          ],
        },
        {
          eventType: "SALES",
          date: "2023-02-20T14:30:00Z",
          invoiceId: "INV-002",
          items: [
            { itemId: "ITEM-003", cost: 2000, taxRate: 0.2 },
            { itemId: "ITEM-004", cost: 1500, taxRate: 0.15 },
          ],
        },
      ];

      const taxPaymentEvents: Array<Transaction> = [
        {
          eventType: "TAX_PAYMENT",
          date: "2023-01-31T16:00:00Z",
          amount: 300,
        },
        {
          eventType: "TAX_PAYMENT",
          date: "2023-02-28T16:00:00Z",
          amount: 500,
        },
      ];

      const amendments: Array<SaleAmendment> = [
        {
          date: "2023-01-20T10:00:00Z",
          invoiceId: "INV-001",
          itemId: "ITEM-001",
          cost: 1200,
          taxRate: 0.2,
        },
        {
          date: "2023-02-25T11:00:00Z",
          invoiceId: "INV-002",
          itemId: "ITEM-003",
          cost: 1800,
          taxRate: 0.2,
        },
      ];

      for (const event of [...salesEvents, ...taxPaymentEvents]) {
        await TransactionModel.store(event);
      }

      for (const amendment of amendments) {
        await AmendmentModel.store(amendment);
      }

      logger.info("Test data generated successfully");

      res.status(200).json({ message: "Test data generated successfully" });
    } catch (error) {
      logger.error("Error generating test data", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
