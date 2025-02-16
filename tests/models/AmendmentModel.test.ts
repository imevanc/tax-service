import { pool } from "../../src/config";
import { AmendmentModel } from "../../src/models";
import { SaleAmendment } from "../../src/types";
import { logger } from "../../src/utils";

jest.mock("../../src/config/pool", () => ({
  pool: {
    connect: jest.fn(),
  },
}));

jest.mock("../../src/utils/logger");

describe("AmendmentModel", () => {
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
    it("should store an amendment successfully", async () => {
      const amendment: SaleAmendment = {
        date: "2023-01-20T10:00:00Z",
        invoiceId: "INV-001",
        itemId: "ITEM-001",
        cost: 1200,
        taxRate: 0.2,
      };

      await AmendmentModel.store(amendment);

      expect(pool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(
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
      expect(mockClient.release).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        `Stored amendment: ${JSON.stringify(amendment)}`,
      );
    });

    it("should throw an error if storing amendment fails", async () => {
      const amendment: SaleAmendment = {
        date: "2023-01-20T10:00:00.000Z",
        invoiceId: "INV-001",
        itemId: "ITEM-001",
        cost: 1200,
        taxRate: 0.2,
      };

      const error = new Error("Database error");
      mockClient.query.mockRejectedValueOnce(error);

      await expect(AmendmentModel.store(amendment)).rejects.toThrow(
        "Database error",
      );

      expect(pool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalled();
      expect(mockClient.release).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        "Error storing amendment:",
        error,
      );
    });
  });

  describe("getBeforeDate", () => {
    it("should return amendments before the specified date", async () => {
      const date = "2023-01-31T23:59:59Z";
      const dbResponse = {
        rows: [
          {
            date: new Date("2023-01-20T10:00:00.000Z"),
            invoice_id: "INV-001",
            item_id: "ITEM-001",
            cost: 1200,
            tax_rate: 0.2,
          },
        ],
      };

      mockClient.query.mockResolvedValueOnce(dbResponse);

      const result = await AmendmentModel.getBeforeDate(date);

      expect(pool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(
        `SELECT date, invoice_id, item_id, cost, tax_rate
                 FROM amendments
                 WHERE date <= $1
                 ORDER BY date ASC`,
        [date],
      );
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toEqual([
        {
          date: "2023-01-20T10:00:00.000Z",
          invoiceId: "INV-001",
          itemId: "ITEM-001",
          cost: 1200,
          taxRate: 0.2,
        },
      ]);
    });

    it("should throw an error if getting amendments fails", async () => {
      const date = "2023-01-31T23:59:59Z";
      const error = new Error("Database error");
      mockClient.query.mockRejectedValueOnce(error);

      await expect(AmendmentModel.getBeforeDate(date)).rejects.toThrow(
        "Database error",
      );

      expect(pool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalled();
      expect(mockClient.release).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        "Error getting amendments:",
        error,
      );
    });
  });
});
