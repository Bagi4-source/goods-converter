import { Formatters, GoodsExporter } from "src";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { brands, categories, products } from "./constants";
import { streamToBuffer } from "./utils/streamToBuffer";

import { PassThrough } from "stream";

describe("GoodsExporter", () => {
  beforeEach(() => {
    vi.setSystemTime(new Date("2023-01-01T00:00:00Z"));
    vi.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const exporter = new GoodsExporter({});

  it("should export without errors", async () => {
    await expect(
      exporter.export(products, categories, brands),
    ).resolves.not.toThrow();
  });

  it("should export with CSV formatter", async () => {
    const stream = new PassThrough();
    exporter.setExporter(() => stream);
    exporter.setFormatter(new Formatters.CSVFormatter());
    await exporter.export(products, categories);
    const resultString = await streamToBuffer(stream);
    const result = resultString.toString();

    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain("Title");
  });

  it("should apply transformers to products", async () => {
    const stream = new PassThrough();
    exporter.setExporter(() => stream);
    exporter.setFormatter(new Formatters.YMLFormatter());
    exporter.setTransformers([
      (products) => {
        return products.map((product) => ({
          ...product,
          price: product.price + 10000,
          images: product.images?.map((image) => image.replace("image", "pic")),
        }));
      },
    ]);
    await exporter.export(products, categories);
    const resultString = await streamToBuffer(stream);
    const result = resultString.toString();

    expect(result).toMatch(
      /<yml_catalog date="2023-01-01T\d{2}:\d{2}[+-]\d{2}:\d{2}">/,
    );
    expect(result).toContain("<price>29000</price>");
    expect(result).toContain("pic1");
    expect(result).toContain("pic2");
  });

  it("should export without transformers", async () => {
    const stream = new PassThrough();
    exporter.setExporter(() => stream);
    exporter.setFormatter(new Formatters.CSVFormatter());
    exporter.setTransformers([]);
    await exporter.export(products, categories);
    const resultString = await streamToBuffer(stream);
    const result = resultString.toString();

    expect(result).toBeTruthy();
    expect(result).toContain("Title");
    expect(result).toContain("19000");
  });

  it("should apply multiple transformers in sequence", async () => {
    const stream = new PassThrough();
    exporter.setExporter(() => stream);
    exporter.setFormatter(new Formatters.YMLFormatter());
    exporter.setTransformers([
      (products) => {
        return products.map((product) => ({
          ...product,
          price: product.price + 1000,
        }));
      },
      (products) => {
        return products.map((product) => ({
          ...product,
          price: product.price * 2,
        }));
      },
    ]);
    await exporter.export(products, categories);
    const resultString = await streamToBuffer(stream);
    const result = resultString.toString();

    expect(result).toContain("<price>40000</price>");
  });

  it("should work with empty products array", async () => {
    const stream = new PassThrough();
    exporter.setExporter(() => stream);
    exporter.setFormatter(new Formatters.CSVFormatter());
    await exporter.export([], categories);
    const resultString = await streamToBuffer(stream);
    const result = resultString.toString();

    expect(result).toBeTruthy();
  });

  it("should work with different formatters", async () => {
    const formatters = [
      new Formatters.JSONFormatter(),
      new Formatters.CSVFormatter(),
      new Formatters.XMLFormatter(),
    ];

    for (const formatter of formatters) {
      const stream = new PassThrough();
      exporter.setExporter(() => stream);
      exporter.setFormatter(formatter);
      await exporter.export(products, categories, brands);
      const resultString = await streamToBuffer(stream);
      const result = resultString.toString();

      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    }
  });

  it("should preserve context in transformers", async () => {
    const context = { multiplier: 2 };
    const contextExporter = new GoodsExporter(context);
    const stream = new PassThrough();
    contextExporter.setExporter(() => stream);
    contextExporter.setFormatter(new Formatters.YMLFormatter());
    contextExporter.setTransformers([
      (products, ctx) => {
        const multiplier = (ctx as { multiplier: number }).multiplier;
        return products.map((product) => ({
          ...product,
          price: product.price * multiplier,
        }));
      },
    ]);
    await contextExporter.export(products, categories);
    const resultString = await streamToBuffer(stream);
    const result = resultString.toString();

    expect(result).toContain("<price>38000</price>");
  });

  vi.useFakeTimers().useRealTimers();
});
