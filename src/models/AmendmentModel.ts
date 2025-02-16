import { pool } from "../config";
import { SaleAmendment } from "../types";
import { logger } from "../utils";

export class AmendmentModel {
  static async store(amendment: SaleAmendment): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO amendments (date, invoice_id, item_id, cost, tax_rate)
                 VALUES ($1, $2, $3, $4, $5)`,
        [
          amendment.date,
          amendment.invoiceId,
          amendment.itemId,
          amendment.cost,
          amendment.taxRate,
        ],
      );
      logger.info(`Stored amendment: ${JSON.stringify(amendment)}`);
    } catch (err) {
      logger.error("Error storing amendment:", err);
      throw err;
    } finally {
      client.release();
    }
  }

  static async getBeforeDate(date: string): Promise<Array<SaleAmendment>> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT date, invoice_id, item_id, cost, tax_rate
                 FROM amendments
                 WHERE date <= $1
                 ORDER BY date ASC`,
        [date],
      );
      return result.rows.map((row) => ({
        date: row.date.toISOString(),
        invoiceId: row.invoice_id,
        itemId: row.item_id,
        cost: row.cost,
        taxRate: row.tax_rate,
      }));
    } catch (err) {
      logger.error("Error getting amendments:", err);
      throw err;
    } finally {
      client.release();
    }
  }
}
