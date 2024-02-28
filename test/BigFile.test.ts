import { describe, it } from "vitest";

import { Currency, Formatters, GoodsExporter, type Product, Vat } from "../src";
import { categories } from "./constants";

describe("Insales formatter", () => {
  const products = new Array<Product>();
  for (let i = 0; i < 1000; i++)
    products.push({
      productId: i,
      variantId: i,
      title: "Title",
      description: "Description",
      vendor: "Nike",
      vendorCode: "NIKE-1111",
      saleDate: "01.01.2020",
      categoryId: i,
      countryOfOrigin: "Китай",
      images: [`image${i}`],
      videos: [],
      price: 19000 + i,
      oldPrice: 20000 + i,
      additionalExpenses: 1000 + i,
      purchasePrice: 15000 + i,
      cofinancePrice: 0,
      currency: Currency.RUR,
      url: `http://localhost:8080/?param${i}=value${i}&param=value`,
      vat: Vat.VAT_20,
      count: i,
      params: [
        {
          key: "param" + Math.ceil(Math.random() * 1000),
          value: "v1",
        },
      ],
      properties: [
        {
          key: "prop" + Math.ceil(Math.random() * 1000),
          value: "v1",
        },
      ],
      keywords: ["Обувь", "Кроссовки"],
    });

  const exporter = new GoodsExporter();

  it(
    "should export big data",
    async () => {
      exporter.setFormatter(new Formatters.InsalesFormatter());
      await exporter.export(products, categories);
    },
    {
      timeout: 60 * 60 * 1000,
    },
  );
});
