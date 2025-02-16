import { Request, Response } from "express";
import { AmendSaleRequest, SaleAmendment } from "../types";
import { AmendmentModel } from "../models";
import { logger } from "../utils";

export class SaleController {
  static async amendSale(req: Request, res: Response): Promise<void> {
    try {
      const amendment = req.body as AmendSaleRequest;

      if (
        !amendment.date ||
        !amendment.invoiceId ||
        !amendment.itemId ||
        amendment.cost === undefined ||
        amendment.taxRate === undefined
      ) {
        logger.error("Invalid amendment payload", amendment);
        res.status(400).json({ error: "Invalid amendment payload" });
        return;
      }

      if (isNaN(Date.parse(amendment.date))) {
        logger.error("Invalid date format", { date: amendment.date });
        res
          .status(400)
          .json({ error: "Invalid date format. Must be ISO 8601" });
        return;
      }

      const saleAmendment: SaleAmendment = {
        date: amendment.date,
        invoiceId: amendment.invoiceId,
        itemId: amendment.itemId,
        cost: amendment.cost,
        taxRate: amendment.taxRate,
      };

      await AmendmentModel.store(saleAmendment);
      logger.info("Sale amended successfully", saleAmendment);

      res.status(202).end();
    } catch (error) {
      logger.error("Error amending sale", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
