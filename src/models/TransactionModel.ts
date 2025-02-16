import { pool } from "../config";
import { Transaction } from "../types";
import { logger } from "../utils";

export class TransactionModel {
  static async store(transaction: Transaction): Promise<void> {
    const client = await pool.connect();
    try {
      if (transaction.eventType === "SALES") {
        await client.query(
          `INSERT INTO transactions (event_type, date, invoice_id, data)
                     VALUES ($1, $2, $3, $4)`
            .replace(/\s+/g, " ")
            .trim(),
          [
            "SALES",
            transaction.date,
            transaction.invoiceId,
            JSON.stringify(transaction),
          ],
        );
      } else if (transaction.eventType === "TAX_PAYMENT") {
        await client.query(
          `INSERT INTO transactions (event_type, date, data)
                     VALUES ($1, $2, $3)`
            .replace(/\s+/g, " ")
            .trim(),
          ["TAX_PAYMENT", transaction.date, JSON.stringify(transaction)],
        );
      }
      logger.info(`Stored transaction: ${JSON.stringify(transaction)}`);
    } catch (err) {
      logger.error("Error storing transaction:", err);
      throw err;
    } finally {
      client.release();
    }
  }

  static async getBeforeDate(date: string): Promise<Array<Transaction>> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT data
                 FROM transactions
                 WHERE date <= $1
                 ORDER BY date ASC`,
        [date],
      );
      return result.rows.map((row) => row.data as Transaction);
    } catch (err) {
      logger.error("Error getting transactions:", err);
      throw err;
    } finally {
      client.release();
    }
  }
}
