import { Request, Response } from "express";
import { TransactionModel } from "../../src/models";
import { TransactionController } from "../../src/controllers";
import { Transaction } from "../../src/types";

describe("TransactionController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(TransactionModel, "store").mockImplementation(async () => {});

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };
  });

  describe("ingestTransaction", () => {
    it("should accept valid sales transaction", async () => {
      const validSalesTransaction: Transaction = {
        eventType: "SALES",
        date: "2024-01-01T00:00:00Z",
        invoiceId: "INV-001",
        items: [{ itemId: "ITEM-1", cost: 1000, taxRate: 0.2 }],
      };

      mockRequest = {
        body: validSalesTransaction,
      };

      await TransactionController.ingestTransaction(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(TransactionModel.store).toHaveBeenCalledWith(
        validSalesTransaction,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(202);
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it("should accept valid tax payment transaction", async () => {
      const validTaxPayment: Transaction = {
        eventType: "TAX_PAYMENT",
        date: "2024-01-01T00:00:00Z",
        amount: 500,
      };

      mockRequest = {
        body: validTaxPayment,
      };

      await TransactionController.ingestTransaction(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(TransactionModel.store).toHaveBeenCalledWith(validTaxPayment);
      expect(mockResponse.status).toHaveBeenCalledWith(202);
      expect(mockResponse.end).toHaveBeenCalled();
    });

    it("should reject transaction with missing eventType", async () => {
      const invalidTransaction = {
        date: "2024-01-01T00:00:00Z",
        invoiceId: "INV-001",
        items: [],
      };

      mockRequest = {
        body: invalidTransaction,
      };

      await TransactionController.ingestTransaction(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(TransactionModel.store).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Invalid transaction payload",
      });
    });

    it("should reject sales transaction with missing items", async () => {
      const invalidSalesTransaction = {
        eventType: "SALES",
        date: "2024-01-01T00:00:00Z",
        invoiceId: "INV-001",
      };

      mockRequest = {
        body: invalidSalesTransaction,
      };

      await TransactionController.ingestTransaction(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(TransactionModel.store).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Invalid sales event payload",
      });
    });

    it("should reject tax payment with missing amount", async () => {
      const invalidTaxPayment = {
        eventType: "TAX_PAYMENT",
        date: "2024-01-01T00:00:00Z",
      };

      mockRequest = {
        body: invalidTaxPayment,
      };

      await TransactionController.ingestTransaction(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(TransactionModel.store).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Invalid tax payment event payload",
      });
    });

    it("should handle database errors", async () => {
      const validTransaction: Transaction = {
        eventType: "SALES",
        date: "2024-01-01T00:00:00Z",
        invoiceId: "INV-001",
        items: [{ itemId: "ITEM-1", cost: 1000, taxRate: 0.2 }],
      };

      mockRequest = {
        body: validTransaction,
      };

      (TransactionModel.store as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await TransactionController.ingestTransaction(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });

    it("should reject transaction with missing date", async () => {
      const invalidTransaction = {
        eventType: "SALES",
        invoiceId: "INV-001",
        items: [{ itemId: "ITEM-1", cost: 1000, taxRate: 0.2 }],
      };

      mockRequest = {
        body: invalidTransaction,
      };

      await TransactionController.ingestTransaction(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(TransactionModel.store).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Invalid transaction payload",
      });
    });

    it("should reject sales transaction with missing invoiceId", async () => {
      const invalidSalesTransaction = {
        eventType: "SALES",
        date: "2024-01-01T00:00:00Z",
        items: [{ itemId: "ITEM-1", cost: 1000, taxRate: 0.2 }],
      };

      mockRequest = {
        body: invalidSalesTransaction,
      };

      await TransactionController.ingestTransaction(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(TransactionModel.store).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Invalid sales event payload",
      });
    });
  });
});
