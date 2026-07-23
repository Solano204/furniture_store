import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate } from "../format";

describe("formatCurrency", () => {
  it("formats a positive number as USD", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });

  it("treats null as zero", () => {
    expect(formatCurrency(null)).toBe("$0.00");
  });

  it("treats zero as zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });
});

describe("formatDate", () => {
  it("formats a date as a long US-style date", () => {
    expect(formatDate(new Date(2026, 0, 15))).toBe("January 15, 2026");
  });
});
