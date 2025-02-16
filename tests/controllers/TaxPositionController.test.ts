import { Request, Response } from "express";
import { TaxPositionController } from "../../src/controllers";
import { AmendmentModel, TransactionModel } from "../../src/models";
import { TaxCalculatorService } from "../../src/services";

jest.mock("../../src/models/AmendmentModel");
jest.mock("../../src/models/TransactionModel");
jest.mock("../../src/services/TaxCalculatorService");
jest.mock("../../src/utils/logger");

describe("TaxPositionController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn(),
    };
  });

  describe("getTaxPosition", () => {
    it("should return 400 if date parameter is missing", async () => {
      mockRequest = {
        query: {},
      };

      await TaxPositionController.getTaxPosition(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Date parameter is required",
      });
    });

    it("should return 400 if date format is invalid", async () => {
      mockRequest = {
        query: { date: "invalid-date" },
      };

      await TaxPositionController.getTaxPosition(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Invalid date format. Must be ISO 8601",
      });
    });

    it("should return 200 with tax position if date is valid", async () => {
      const date = "2024-01-01T00:00:00Z";
      const transactions = [{ id: 1, amount: 100 }];
      const amendments = [{ id: 1, adjustment: 10 }];
      const taxPosition = { total: 90 };

      mockRequest = {
        query: { date },
      };

      (TransactionModel.getBeforeDate as jest.Mock).mockResolvedValue(
        transactions,
      );
      (AmendmentModel.getBeforeDate as jest.Mock).mockResolvedValue(amendments);
      (TaxCalculatorService.calculate as jest.Mock).mockReturnValue(
        taxPosition,
      );

      await TaxPositionController.getTaxPosition(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(TransactionModel.getBeforeDate).toHaveBeenCalledWith(date);
      expect(AmendmentModel.getBeforeDate).toHaveBeenCalledWith(date);
      expect(TaxCalculatorService.calculate).toHaveBeenCalledWith(
        transactions,
        amendments,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        date,
        taxPosition,
      });
    });

    it("should return 500 if there is an error", async () => {
      const date = "2024-01-01T00:00:00Z";

      mockRequest = {
        query: { date },
      };

      (TransactionModel.getBeforeDate as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await TaxPositionController.getTaxPosition(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });
});
