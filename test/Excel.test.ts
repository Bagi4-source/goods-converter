import { Formatters, GoodsExporter } from "src";
import { expect, describe, it, vi, beforeEach } from "vitest";

import { categories, products } from "./constants";
import { streamToBuffer } from "./utils/streamToBuffer";

import { PassThrough } from "stream";

describe("Excel formatter", () => {
  beforeEach(() => {
    // tell vitest we use mocked time
    vi.setSystemTime(new Date("2023-01-01T00:00:00Z"));
  });

  const formatter = new Formatters.ExcelFormatter();

  it("should export Excel data", async () => {
    const stream = new PassThrough();
    await formatter.format(stream, products, categories);
    const resultString = await streamToBuffer(stream);

    expect(resultString.toString()).toMatchSnapshot();
  });

  it("should export Excel file", async () => {
    const exporter = new GoodsExporter();
    exporter.setFormatter(formatter);
    await exporter.export(products, categories);
  });
});
