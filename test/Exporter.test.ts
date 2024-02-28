import { describe, expect, it, vi } from "vitest";

import { Formatters, GoodsExporter } from "../src";
import { categories, products } from "./constants";

import { PassThrough } from "stream";

describe("GoodsExporter", () => {
  vi.useFakeTimers().setSystemTime(new Date("2020-01-01"));
  const exporter = new GoodsExporter();

  it("check export", async () => {
    await exporter.export(products, categories);
  });

  it("check export with formatter", async () => {
    const stream = new PassThrough();
    exporter.setExporter(() => stream);
    exporter.setFormatter(new Formatters.CSVFormatter());
    await exporter.export(products, categories);
    expect(stream).toMatchSnapshot();
  });

  it("check export with transformers", async () => {
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
    expect(stream).toMatchSnapshot();
  });

  it("check export without transformers", async () => {
    const stream = new PassThrough();
    exporter.setExporter(() => stream);
    exporter.setFormatter(new Formatters.CSVFormatter());
    await exporter.export(products, categories);
    expect(stream).toMatchSnapshot();
  });

  vi.useFakeTimers().useRealTimers();
});
