import { Formatters, GoodsExporter } from "src";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { brands, categories, products } from "./constants";
import { streamToBuffer } from "./utils/streamToBuffer";

import { PassThrough } from "stream";

describe("GoodsExporter", () => {
  beforeEach(() => {
    // tell vitest we use mocked time
    vi.setSystemTime(new Date("2023-01-01T00:00:00Z"));
  });

  const exporter = new GoodsExporter({});

  it("check export", async () => {
    await exporter.export(products, categories, brands);
  });

  it("check export with formatter", async () => {
    const stream = new PassThrough();
    exporter.setExporter(() => stream);
    exporter.setFormatter(new Formatters.CSVFormatter());
    await exporter.export(products, categories);
    const resultString = await streamToBuffer(stream);

    expect(resultString.toString()).toMatchSnapshot();
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
    const resultString = await streamToBuffer(stream);

    expect(resultString.toString()).toMatchSnapshot();
  });

  it("check export without transformers", async () => {
    const stream = new PassThrough();
    exporter.setExporter(() => stream);
    exporter.setFormatter(new Formatters.CSVFormatter());
    await exporter.export(products, categories);
    const resultString = await streamToBuffer(stream);

    expect(resultString.toString()).toMatchSnapshot();
  });

  vi.useFakeTimers().useRealTimers();
});
