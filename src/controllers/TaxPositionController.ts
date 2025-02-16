import { Request, Response } from "express";
import { AmendmentModel, TransactionModel } from "../models";
import { TaxCalculatorService } from "../services";
import { logger } from "../utils";

export class TaxPositionController {
  static async getTaxPosition(req: Request, res: Response): Promise<void> {
    try {
      const date = req.query.date as string;

      if (!date) {
        logger.error("Missing date parameter");
        res.status(400).json({ error: "Date parameter is required" });
        return;
      }

      if (isNaN(Date.parse(date))) {
        logger.error("Invalid date format", { date });
        res
          .status(400)
          .json({ error: "Invalid date format. Must be ISO 8601" });
        return;
      }

      const transactions = await TransactionModel.getBeforeDate(date);
      const amendments = await AmendmentModel.getBeforeDate(date);

      const taxPosition = TaxCalculatorService.calculate(
        transactions,
        amendments,
      );

      logger.info("Tax position calculated successfully", {
        date,
        taxPosition,
      });

      res.status(200).json({
        date,
        taxPosition,
      });
    } catch (error) {
      logger.error("Error calculating tax position", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
