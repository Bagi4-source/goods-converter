import { describe, expect, it, vi } from "vitest";

import { Formatters, GoodsExporter } from "../src";
import { categories, products } from "./constants";

describe("GoodsExporter", () => {
  vi.useFakeTimers().setSystemTime(new Date("2020-01-01"));

  const exporter = new GoodsExporter();

  it("check export", async () => {
    const data = await exporter.export(products, categories);

    expect(data.toString("utf-8")).toMatchSnapshot();
  });

  it("check export with transformers", async () => {
    exporter.setFormatter(new Formatters.YMLFormatter());
    exporter.setExporter((data: Buffer) => {
      return data;
    });
    exporter.setTransformers([
      (product) => ({
        ...product,
        price: product.price + 10000,
        images: product.images?.map((image) => image.replace("image", "pic")),
      }),
    ]);

    const data = await exporter.export(products, categories);

    expect(data.toString("utf-8")).toMatchSnapshot();
  });
  it("check export without transformers", async () => {
    exporter.setFormatter(new Formatters.ExcelFormatter());

    const data = await exporter.export(products, categories);

    expect(data).toMatchSnapshot();
  });
});
