import { Request, Response } from "express";
import { Transaction } from "../types";
import { TransactionModel } from "../models/";
import { logger } from "../utils";

export class TransactionController {
  static async ingestTransaction(req: Request, res: Response): Promise<void> {
    try {
      const transaction = req.body as Transaction;

      if (!transaction.eventType || !transaction.date) {
        logger.error("Invalid transaction payload", transaction);
        res.status(400).json({ error: "Invalid transaction payload" });
        return;
      }

      if (
        transaction.eventType === "SALES" &&
        (!transaction.invoiceId || !transaction.items)
      ) {
        logger.error("Invalid sales event payload", transaction);
        res.status(400).json({ error: "Invalid sales event payload" });
        return;
      }

      if (
        transaction.eventType === "TAX_PAYMENT" &&
        transaction.amount === undefined
      ) {
        logger.error("Invalid tax payment event payload", transaction);
        res.status(400).json({ error: "Invalid tax payment event payload" });
        return;
      }

      await TransactionModel.store(transaction);
      logger.info("Transaction ingested successfully", transaction);

      res.status(202).end();
    } catch (error) {
      logger.error("Error processing transaction", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
