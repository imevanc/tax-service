import express from "express";
import {
  SaleController,
  TaxPositionController,
  TestDataController,
  TransactionController,
} from "./controllers";

export const router = express.Router();

router.post("/transactions", TransactionController.ingestTransaction);

router.get("/tax-position", TaxPositionController.getTaxPosition);

router.patch("/sale", SaleController.amendSale);

router.post("/generate-test-data", TestDataController.generateTestData);
