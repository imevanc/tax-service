import { Request, Response } from "express";
import { SaleController } from "../../src/controllers";
import { AmendmentModel } from "../../src/models";
import { logger } from "../../src/utils";

jest.mock("../../src/models/AmendmentModel");
jest.mock("../../src/utils/logger");

describe("SaleController", () => {
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

  describe("amendSale", () => {
    it("should return 400 if amendment payload is invalid", async () => {
      mockRequest = {
        body: {},
      };

      await SaleController.amendSale(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Invalid amendment payload",
      });
      expect(logger.error).toHaveBeenCalledWith(
        "Invalid amendment payload",
        {},
      );
    });

    it("should return 400 if date format is invalid", async () => {
      mockRequest = {
        body: {
          date: "invalid-date",
          invoiceId: "INV-001",
          itemId: "ITEM-1",
          cost: 1000,
          taxRate: 0.2,
        },
      };

      await SaleController.amendSale(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Invalid date format. Must be ISO 8601",
      });
      expect(logger.error).toHaveBeenCalledWith("Invalid date format", {
        date: "invalid-date",
      });
    });

    it("should return 202 if amendment is successful", async () => {
      const validAmendment = {
        date: "2024-01-01T00:00:00Z",
        invoiceId: "INV-001",
        itemId: "ITEM-1",
        cost: 1000,
        taxRate: 0.2,
      };

      mockRequest = {
        body: validAmendment,
      };

      await SaleController.amendSale(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(AmendmentModel.store).toHaveBeenCalledWith(validAmendment);
      expect(mockResponse.status).toHaveBeenCalledWith(202);
      expect(mockResponse.end).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        "Sale amended successfully",
        validAmendment,
      );
    });

    it("should return 500 if there is an error", async () => {
      const validAmendment = {
        date: "2024-01-01T00:00:00Z",
        invoiceId: "INV-001",
        itemId: "ITEM-1",
        cost: 1000,
        taxRate: 0.2,
      };

      mockRequest = {
        body: validAmendment,
      };

      (AmendmentModel.store as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await SaleController.amendSale(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Internal server error",
      });
      expect(logger.error).toHaveBeenCalledWith(
        "Error amending sale",
        expect.any(Error),
      );
    });
  });
});
