import { pool } from "../../src/config";
import { TransactionModel } from "../../src/models";
import { Transaction } from "../../src/types";
import { logger } from "../../src/utils";

jest.mock("../../src/config/pool", () => ({
  pool: {
    connect: jest.fn(),
  },
}));

jest.mock("../../src/utils/logger");

describe("TransactionModel", () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    (pool.connect as jest.Mock).mockResolvedValue(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("store", () => {
    it("should store a sales transaction successfully", async () => {
      const transaction: Transaction = {
        eventType: "SALES",
        date: "2023-01-20T10:00:00Z",
        invoiceId: "INV-001",
        items: [{ itemId: "ITEM-001", cost: 1200, taxRate: 0.2 }],
      };

      await TransactionModel.store(transaction);

      expect(pool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(
        `INSERT INTO transactions (event_type, date, invoice_id, data)
                 VALUES ($1, $2, $3, $4)`
          .replace(/\s+/g, " ")
          .trim(),
        [
          "SALES",
          "2023-01-20T10:00:00Z",
          "INV-001",
          JSON.stringify(transaction),
        ],
      );
      expect(mockClient.release).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        `Stored transaction: ${JSON.stringify(transaction)}`,
      );
    });

    it("should store a tax payment transaction successfully", async () => {
      const transaction: Transaction = {
        eventType: "TAX_PAYMENT",
        date: "2023-01-20T10:00:00Z",
        amount: 500,
      };

      await TransactionModel.store(transaction);

      expect(pool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(
        `INSERT INTO transactions (event_type, date, data)
                 VALUES ($1, $2, $3)`
          .replace(/\s+/g, " ")
          .trim(),
        ["TAX_PAYMENT", transaction.date, JSON.stringify(transaction)],
      );
      expect(mockClient.release).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        `Stored transaction: ${JSON.stringify(transaction)}`,
      );
    });

    it("should throw an error if storing transaction fails", async () => {
      const transaction: Transaction = {
        eventType: "SALES",
        date: "2023-01-20T10:00:00Z",
        invoiceId: "INV-001",
        items: [{ itemId: "ITEM-001", cost: 1200, taxRate: 0.2 }],
      };

      const error = new Error("Database error");
      mockClient.query.mockRejectedValueOnce(error);

      await expect(TransactionModel.store(transaction)).rejects.toThrow(
        "Database error",
      );

      expect(pool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalled();
      expect(mockClient.release).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        "Error storing transaction:",
        error,
      );
    });
  });

  describe("getBeforeDate", () => {
    it("should return transactions before the specified date", async () => {
      const date = "2023-01-31T23:59:59Z";
      const dbResponse = {
        rows: [
          {
            data: {
              eventType: "SALES",
              date: "2023-01-20T10:00:00Z",
              invoiceId: "INV-001",
              items: [{ itemId: "ITEM-001", cost: 1200, taxRate: 0.2 }],
            },
          },
        ],
      };

      mockClient.query.mockResolvedValueOnce(dbResponse);

      const result = await TransactionModel.getBeforeDate(date);

      expect(pool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(
        `SELECT data
                 FROM transactions
                 WHERE date <= $1
                 ORDER BY date ASC`,
        [date],
      );
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toEqual([
        {
          eventType: "SALES",
          date: "2023-01-20T10:00:00Z",
          invoiceId: "INV-001",
          items: [{ itemId: "ITEM-001", cost: 1200, taxRate: 0.2 }],
        },
      ]);
    });

    it("should throw an error if getting transactions fails", async () => {
      const date = "2023-01-31T23:59:59Z";
      const error = new Error("Database error");
      mockClient.query.mockRejectedValueOnce(error);

      await expect(TransactionModel.getBeforeDate(date)).rejects.toThrow(
        "Database error",
      );

      expect(pool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalled();
      expect(mockClient.release).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        "Error getting transactions:",
        error,
      );
    });
  });
});
