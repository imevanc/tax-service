import { TaxCalculatorService } from "../../src/services";
import { SaleAmendment, Transaction } from "../../src/types";

describe("TaxCalculatorService", () => {
  describe("Basic Calculations", () => {
    it("should calculate tax for a single sale without amendments", () => {
      const transactions: Array<Transaction> = [
        {
          eventType: "SALES",
          date: "2024-01-01T00:00:00Z",
          invoiceId: "INV1",
          items: [{ itemId: "ITEM1", cost: 100, taxRate: 0.2 }],
        },
      ];

      const result = TaxCalculatorService.calculate(transactions, []);
      expect(result).toBe(20); // 100 * 0.2 = 20
    });

    it("should calculate tax for multiple items in a sale", () => {
      const transactions: Array<Transaction> = [
        {
          eventType: "SALES",
          date: "2024-01-01T00:00:00Z",
          invoiceId: "INV1",
          items: [
            { itemId: "ITEM1", cost: 100, taxRate: 0.2 },
            { itemId: "ITEM2", cost: 50, taxRate: 0.1 },
          ],
        },
      ];

      const result = TaxCalculatorService.calculate(transactions, []);
      expect(result).toBe(25); // (100 * 0.2) + (50 * 0.1) = 20 + 5 = 25
    });

    it("should handle tax payments correctly", () => {
      const transactions: Array<Transaction> = [
        {
          eventType: "SALES",
          date: "2024-01-01T00:00:00Z",
          invoiceId: "INV1",
          items: [{ itemId: "ITEM1", cost: 100, taxRate: 0.2 }],
        },
        {
          eventType: "TAX_PAYMENT",
          date: "2024-01-02T00:00:00Z",
          amount: 15,
        },
      ];

      const result = TaxCalculatorService.calculate(transactions, []);
      expect(result).toBe(5); // (100 * 0.2) - 15 = 20 - 15 = 5
    });
  });

  describe("Amendments", () => {
    it("should apply amendment correctly for a single item", () => {
      const transactions: Array<Transaction> = [
        {
          eventType: "SALES",
          date: "2024-01-01T00:00:00Z",
          invoiceId: "INV1",
          items: [{ itemId: "ITEM1", cost: 100, taxRate: 0.2 }],
        },
      ];

      const amendments: Array<SaleAmendment> = [
        {
          date: "2024-01-02T00:00:00Z",
          invoiceId: "INV1",
          itemId: "ITEM1",
          cost: 150,
          taxRate: 0.15,
        },
      ];

      const result = TaxCalculatorService.calculate(transactions, amendments);
      expect(result).toBe(23); // 150 * 0.15 = 22.5, rounded to 23
    });

    it("should apply the latest amendment when multiple amendments exist", () => {
      const transactions: Array<Transaction> = [
        {
          eventType: "SALES",
          date: "2024-01-01T00:00:00Z",
          invoiceId: "INV1",
          items: [{ itemId: "ITEM1", cost: 100, taxRate: 0.2 }],
        },
      ];

      const amendments: Array<SaleAmendment> = [
        {
          date: "2024-01-02T00:00:00Z",
          invoiceId: "INV1",
          itemId: "ITEM1",
          cost: 150,
          taxRate: 0.15,
        },
        {
          date: "2024-01-03T00:00:00Z",
          invoiceId: "INV1",
          itemId: "ITEM1",
          cost: 200,
          taxRate: 0.1,
        },
      ];

      const result = TaxCalculatorService.calculate(transactions, amendments);
      expect(result).toBe(20); // 200 * 0.1 = 20
    });

    it("should only amend specified items and use original values for others", () => {
      const transactions: Array<Transaction> = [
        {
          eventType: "SALES",
          date: "2024-01-01T00:00:00Z",
          invoiceId: "INV1",
          items: [
            { itemId: "ITEM1", cost: 100, taxRate: 0.2 },
            { itemId: "ITEM2", cost: 50, taxRate: 0.1 },
          ],
        },
      ];

      const amendments: Array<SaleAmendment> = [
        {
          date: "2024-01-02T00:00:00Z",
          invoiceId: "INV1",
          itemId: "ITEM1",
          cost: 150,
          taxRate: 0.15,
        },
      ];

      const result = TaxCalculatorService.calculate(transactions, amendments);
      expect(result).toBe(28); // (150 * 0.15) + (50 * 0.1) = 22.5 + 5 = 27.5, rounded to 28
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty transaction list", () => {
      const result = TaxCalculatorService.calculate([], []);
      expect(result).toBe(0);
    });

    it("should handle empty items list in sales transaction", () => {
      const transactions: Array<Transaction> = [
        {
          eventType: "SALES",
          date: "2024-01-01T00:00:00Z",
          invoiceId: "INV1",
          items: [],
        },
      ];

      const result = TaxCalculatorService.calculate(transactions, []);
      expect(result).toBe(0);
    });

    it("should handle very small numbers correctly", () => {
      const transactions: Array<Transaction> = [
        {
          eventType: "SALES",
          date: "2024-01-01T00:00:00Z",
          invoiceId: "INV1",
          items: [{ itemId: "ITEM1", cost: 0.01, taxRate: 0.2 }],
        },
      ];

      const result = TaxCalculatorService.calculate(transactions, []);
      expect(result).toBe(0); // 0.01 * 0.2 = 0.002, rounded to 0
    });

    it("should handle large numbers correctly", () => {
      const transactions: Array<Transaction> = [
        {
          eventType: "SALES",
          date: "2024-01-01T00:00:00Z",
          invoiceId: "INV1",
          items: [{ itemId: "ITEM1", cost: 1000000, taxRate: 0.2 }],
        },
      ];

      const result = TaxCalculatorService.calculate(transactions, []);
      expect(result).toBe(200000); // 1000000 * 0.2 = 200000
    });
  });

  describe("Validation and Error Cases", () => {
    it("should throw error for negative cost", () => {
      const transactions: Array<Transaction> = [
        {
          eventType: "SALES",
          date: "2024-01-01T00:00:00Z",
          invoiceId: "INV1",
          items: [{ itemId: "ITEM1", cost: -100, taxRate: 0.2 }],
        },
      ];

      expect(() => {
        TaxCalculatorService.calculate(transactions, []);
      }).toThrow("Invalid cost or tax rate for item ITEM1");
    });

    it("should throw error for negative tax rate", () => {
      const transactions: Array<Transaction> = [
        {
          eventType: "SALES",
          date: "2024-01-01T00:00:00Z",
          invoiceId: "INV1",
          items: [{ itemId: "ITEM1", cost: 100, taxRate: -0.2 }],
        },
      ];

      expect(() => {
        TaxCalculatorService.calculate(transactions, []);
      }).toThrow("Invalid cost or tax rate for item ITEM1");
    });

    it("should throw error for tax rate greater than 1", () => {
      const transactions: Array<Transaction> = [
        {
          eventType: "SALES",
          date: "2024-01-01T00:00:00Z",
          invoiceId: "INV1",
          items: [{ itemId: "ITEM1", cost: 100, taxRate: 1.2 }],
        },
      ];

      expect(() => {
        TaxCalculatorService.calculate(transactions, []);
      }).toThrow("Invalid cost or tax rate for item ITEM1");
    });

    it("should throw error for negative tax payment amount", () => {
      const transactions: Array<Transaction> = [
        {
          eventType: "TAX_PAYMENT",
          date: "2024-01-01T00:00:00Z",
          amount: -100,
        },
      ];

      expect(() => {
        TaxCalculatorService.calculate(transactions, []);
      }).toThrow("Invalid tax payment amount");
    });
  });

  describe("Date Handling", () => {
    it("should process all transactions and amendments regardless of date", () => {
      const transactions: Array<Transaction> = [
        {
          eventType: "SALES",
          date: "2024-01-01T00:00:00Z",
          invoiceId: "INV1",
          items: [{ itemId: "ITEM1", cost: 100, taxRate: 0.2 }],
        },
        {
          eventType: "SALES",
          date: "2024-01-03T00:00:00Z",
          invoiceId: "INV2",
          items: [{ itemId: "ITEM2", cost: 200, taxRate: 0.2 }],
        },
      ];

      const amendments: Array<SaleAmendment> = [
        {
          date: "2024-01-02T00:00:00Z",
          invoiceId: "INV1",
          itemId: "ITEM1",
          cost: 150,
          taxRate: 0.15,
        },
      ];

      const result = TaxCalculatorService.calculate(transactions, amendments);
      expect(result).toBe(63); // (150 * 0.15) + (200 * 0.2) = 22.5 + 40 = 62.5, rounded to 63
    });
  });
});
