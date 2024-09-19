import { Formatters, GoodsExporter } from "src";
import { expect, describe, it, vi, afterEach, beforeEach } from "vitest";

import { categories, products } from "./constants";
import { streamToBuffer } from "./utils/streamToBuffer";

describe("Excel formatter", () => {
  beforeEach(() => {
    // tell vitest we use mocked time
    vi.setSystemTime(new Date("2023-01-01T00:00:00Z"));
  });

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers();
  });

  const formatter = new Formatters.ExcelFormatter();

  it("should export Excel data", async () => {
    const result = await formatter.format(products, categories);
    const resultString = await streamToBuffer(result);

    expect(resultString.toString()).toMatchSnapshot();
  });

  it("should export Excel file", async () => {
    const exporter = new GoodsExporter();
    exporter.setFormatter(formatter);
    await exporter.export(products, categories);
  }, 500000);
});
