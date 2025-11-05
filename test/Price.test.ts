import { Formatters, Currency, Vat } from "src";
import type { Product } from "src";
import { expect, describe, it } from "vitest";

import { streamToBuffer } from "./utils/streamToBuffer";

import { PassThrough } from "stream";

describe("Price formatter", () => {
  const formatter = new Formatters.PriceFormatter();

  it("should return empty array for empty products", async () => {
    const stream = new PassThrough();
    await formatter.format(stream, []);

    const resultString = await streamToBuffer(stream);
    const result = JSON.parse(resultString.toString());

    expect(result).toEqual([]);
  });

  it("should format single product with one SKU without timeDelivery", async () => {
    const products: Product[] = [
      {
        productId: 1,
        variantId: 111,
        title: "Test",
        description: "Test",
        categoryId: 1,
        price: 1000,
        currency: Currency.RUR,
        vat: Vat.VAT_20,
      },
    ];

    const stream = new PassThrough();
    await formatter.format(stream, products);

    const resultString = await streamToBuffer(stream);
    const result = JSON.parse(resultString.toString());

    expect(result).toEqual([
      {
        productId: 1,
        skus: [
          {
            skuId: "111",
            price: 1000,
            currency: Currency.RUR,
          },
        ],
      },
    ]);
  });

  it("should group multiple SKUs by productId", async () => {
    const products: Product[] = [
      {
        productId: 1,
        variantId: 111,
        title: "Test",
        description: "Test",
        categoryId: 1,
        price: 1000,
        currency: Currency.RUR,
        vat: Vat.VAT_20,
      },
      {
        productId: 1,
        variantId: 112,
        title: "Test",
        description: "Test",
        categoryId: 1,
        price: 1200,
        currency: Currency.RUR,
        vat: Vat.VAT_20,
      },
    ];

    const stream = new PassThrough();
    await formatter.format(stream, products);

    const resultString = await streamToBuffer(stream);
    const result = JSON.parse(resultString.toString());

    expect(result).toEqual([
      {
        productId: 1,
        skus: [
          {
            skuId: "111",
            price: 1000,
            currency: Currency.RUR,
          },
          {
            skuId: "112",
            price: 1200,
            currency: Currency.RUR,
          },
        ],
      },
    ]);
  });

  it("should include timeDelivery when both min and max are provided", async () => {
    const products: Product[] = [
      {
        productId: 1,
        variantId: 111,
        title: "Test",
        description: "Test",
        categoryId: 1,
        price: 1000,
        currency: Currency.RUR,
        vat: Vat.VAT_20,
        timeDelivery: {
          min: 3,
          max: 7,
        },
      },
    ];

    const stream = new PassThrough();
    await formatter.format(stream, products);

    const resultString = await streamToBuffer(stream);
    const result = JSON.parse(resultString.toString());

    expect(result).toEqual([
      {
        productId: 1,
        skus: [
          {
            skuId: "111",
            price: 1000,
            currency: Currency.RUR,
            timeDelivery: {
              min: 3,
              max: 7,
            },
          },
        ],
      },
    ]);
  });

  it("should include timeDelivery when only min is provided", async () => {
    const products: Product[] = [
      {
        productId: 1,
        variantId: 111,
        title: "Test",
        description: "Test",
        categoryId: 1,
        price: 1000,
        currency: Currency.RUR,
        vat: Vat.VAT_20,
        timeDelivery: {
          min: 5,
        },
      },
    ];

    const stream = new PassThrough();
    await formatter.format(stream, products);

    const resultString = await streamToBuffer(stream);
    const result = JSON.parse(resultString.toString());

    expect(result).toEqual([
      {
        productId: 1,
        skus: [
          {
            skuId: "111",
            price: 1000,
            currency: Currency.RUR,
            timeDelivery: {
              min: 5,
              max: 0,
            },
          },
        ],
      },
    ]);
  });

  it("should include timeDelivery when only max is provided", async () => {
    const products: Product[] = [
      {
        productId: 1,
        variantId: 111,
        title: "Test",
        description: "Test",
        categoryId: 1,
        price: 1000,
        currency: Currency.RUR,
        vat: Vat.VAT_20,
        timeDelivery: {
          max: 10,
        },
      },
    ];

    const stream = new PassThrough();
    await formatter.format(stream, products);

    const resultString = await streamToBuffer(stream);
    const result = JSON.parse(resultString.toString());

    expect(result).toEqual([
      {
        productId: 1,
        skus: [
          {
            skuId: "111",
            price: 1000,
            currency: Currency.RUR,
            timeDelivery: {
              min: 0,
              max: 10,
            },
          },
        ],
      },
    ]);
  });

  it("should handle different currencies", async () => {
    const products: Product[] = [
      {
        productId: 1,
        variantId: 111,
        title: "Test",
        description: "Test",
        categoryId: 1,
        price: 1000,
        currency: Currency.USD,
        vat: Vat.VAT_20,
      },
      {
        productId: 2,
        variantId: 222,
        title: "Test",
        description: "Test",
        categoryId: 1,
        price: 2000,
        currency: Currency.EUR,
        vat: Vat.VAT_20,
      },
    ];

    const stream = new PassThrough();
    await formatter.format(stream, products);

    const resultString = await streamToBuffer(stream);
    const result = JSON.parse(resultString.toString());

    expect(result).toEqual([
      {
        productId: 1,
        skus: [
          {
            skuId: "111",
            price: 1000,
            currency: Currency.USD,
          },
        ],
      },
      {
        productId: 2,
        skus: [
          {
            skuId: "222",
            price: 2000,
            currency: Currency.EUR,
          },
        ],
      },
    ]);
  });

  it("should handle multiple products with multiple SKUs", async () => {
    const products: Product[] = [
      {
        productId: 1,
        variantId: 111,
        title: "Test",
        description: "Test",
        categoryId: 1,
        price: 1000,
        currency: Currency.RUR,
        vat: Vat.VAT_20,
      },
      {
        productId: 1,
        variantId: 112,
        title: "Test",
        description: "Test",
        categoryId: 1,
        price: 1100,
        currency: Currency.RUR,
        vat: Vat.VAT_20,
        timeDelivery: {
          min: 2,
          max: 5,
        },
      },
      {
        productId: 2,
        variantId: 221,
        title: "Test",
        description: "Test",
        categoryId: 1,
        price: 2000,
        currency: Currency.USD,
        vat: Vat.VAT_20,
      },
    ];

    const stream = new PassThrough();
    await formatter.format(stream, products);

    const resultString = await streamToBuffer(stream);
    const result = JSON.parse(resultString.toString());

    expect(result).toEqual([
      {
        productId: 1,
        skus: [
          {
            skuId: "111",
            price: 1000,
            currency: Currency.RUR,
          },
          {
            skuId: "112",
            price: 1100,
            currency: Currency.RUR,
            timeDelivery: {
              min: 2,
              max: 5,
            },
          },
        ],
      },
      {
        productId: 2,
        skus: [
          {
            skuId: "221",
            price: 2000,
            currency: Currency.USD,
          },
        ],
      },
    ]);
  });

  it("should not include timeDelivery when it is undefined", async () => {
    const products: Product[] = [
      {
        productId: 1,
        variantId: 111,
        title: "Test",
        description: "Test",
        categoryId: 1,
        price: 1000,
        currency: Currency.RUR,
        vat: Vat.VAT_20,
      },
    ];

    const stream = new PassThrough();
    await formatter.format(stream, products);

    const resultString = await streamToBuffer(stream);
    const result = JSON.parse(resultString.toString());

    expect(result[0].skus[0].timeDelivery).toBeUndefined();
  });

  it("should convert variantId to string for skuId", async () => {
    const products: Product[] = [
      {
        productId: 1,
        variantId: 12345,
        title: "Test",
        description: "Test",
        categoryId: 1,
        price: 1000,
        currency: Currency.RUR,
        vat: Vat.VAT_20,
      },
    ];

    const stream = new PassThrough();
    await formatter.format(stream, products);

    const resultString = await streamToBuffer(stream);
    const result = JSON.parse(resultString.toString());

    expect(typeof result[0].skus[0].skuId).toBe("string");
    expect(result[0].skus[0].skuId).toBe("12345");
  });

  it("should include salesProperties with params when provided", async () => {
    const products: Product[] = [
      {
        productId: 1,
        variantId: 111,
        title: "Test",
        description: "Test",
        categoryId: 1,
        price: 1000,
        currency: Currency.RUR,
        vat: Vat.VAT_20,
        params: [
          {
            key: "Размер",
            value: "36,37,38,39",
          },
        ],
      },
    ];

    const stream = new PassThrough();
    await formatter.format(stream, products);

    const resultString = await streamToBuffer(stream);
    const result = JSON.parse(resultString.toString());

    expect(result[0].salesProperties).toEqual([
      {
        name: "Размер",
        delimiter: ",",
        value: "36,37,38,39",
      },
    ]);
  });

  it("should include multiple salesProperties", async () => {
    const products: Product[] = [
      {
        productId: 1,
        variantId: 111,
        title: "Test",
        description: "Test",
        categoryId: 1,
        price: 1000,
        currency: Currency.RUR,
        vat: Vat.VAT_20,
        params: [
          {
            key: "Размер UK",
            value: "36,37,38",
          },
          {
            key: "Размер EU",
            value: "42,44,46",
          },
        ],
      },
    ];

    const stream = new PassThrough();
    await formatter.format(stream, products);

    const resultString = await streamToBuffer(stream);
    const result = JSON.parse(resultString.toString());

    expect(result[0].salesProperties).toEqual([
      {
        name: "Размер UK",
        delimiter: ",",
        value: "36,37,38",
      },
      {
        name: "Размер EU",
        delimiter: ",",
        value: "42,44,46",
      },
    ]);
  });

  it("should not include salesProperties when params are not provided", async () => {
    const products: Product[] = [
      {
        productId: 1,
        variantId: 111,
        title: "Test",
        description: "Test",
        categoryId: 1,
        price: 1000,
        currency: Currency.RUR,
        vat: Vat.VAT_20,
      },
    ];

    const stream = new PassThrough();
    await formatter.format(stream, products);

    const resultString = await streamToBuffer(stream);
    const result = JSON.parse(resultString.toString());

    expect(result[0].salesProperties).toBeUndefined();
  });

  it("should not include salesProperties when params array is empty", async () => {
    const products: Product[] = [
      {
        productId: 1,
        variantId: 111,
        title: "Test",
        description: "Test",
        categoryId: 1,
        price: 1000,
        currency: Currency.RUR,
        vat: Vat.VAT_20,
        params: [],
      },
    ];

    const stream = new PassThrough();
    await formatter.format(stream, products);

    const resultString = await streamToBuffer(stream);
    const result = JSON.parse(resultString.toString());

    expect(result[0].salesProperties).toBeUndefined();
  });

  it("should include salesProperties only for first product when grouping by productId", async () => {
    const products: Product[] = [
      {
        productId: 1,
        variantId: 111,
        title: "Test",
        description: "Test",
        categoryId: 1,
        price: 1000,
        currency: Currency.RUR,
        vat: Vat.VAT_20,
        params: [
          {
            key: "Размер",
            value: "36,37",
          },
        ],
      },
      {
        productId: 1,
        variantId: 112,
        title: "Test",
        description: "Test",
        categoryId: 1,
        price: 1200,
        currency: Currency.RUR,
        vat: Vat.VAT_20,
      },
    ];

    const stream = new PassThrough();
    await formatter.format(stream, products);

    const resultString = await streamToBuffer(stream);
    const result = JSON.parse(resultString.toString());

    expect(result[0].salesProperties).toEqual([
      {
        name: "Размер",
        delimiter: ",",
        value: "36,37",
      },
    ]);
    expect(result[0].skus).toHaveLength(2);
  });
});
