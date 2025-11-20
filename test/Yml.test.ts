import { Formatters, Currency, Vat } from "src";
import type { Product } from "src";
import { expect, describe, it, vi, beforeEach, afterEach } from "vitest";

import { brands, categories, products } from "./constants";
import { streamToBuffer } from "./utils/streamToBuffer";

import { PassThrough } from "stream";

describe("YML formatter", () => {
  const formatter = new Formatters.YMLFormatter();

  beforeEach(() => {
    vi.setSystemTime(new Date("2023-01-01T00:00:00Z"));
    vi.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should export YML with correct XML structure", async () => {
    const stream = new PassThrough();
    await formatter.format(stream, products, categories, brands, {
      shopName: "Bagi4",
      companyName: "Bagi4",
    });

    const resultString = await streamToBuffer(stream);
    const result = resultString.toString();

    expect(result).toContain(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    );
    expect(result).toMatch(
      /<yml_catalog date="2023-01-01T\d{2}:\d{2}[+-]\d{2}:\d{2}">/,
    );
    expect(result).toContain("<shop>");
    expect(result).toContain("</shop>");
    expect(result).toContain("</yml_catalog>");
  });

  it("should include shop name and company name", async () => {
    const stream = new PassThrough();
    await formatter.format(stream, products, categories, brands, {
      shopName: "TestShop",
      companyName: "TestCompany",
    });

    const resultString = await streamToBuffer(stream);
    const result = resultString.toString();

    expect(result).toContain("<name>TestShop</name>");
    expect(result).toContain("<company>TestCompany</company>");
  });

  it("should include categories", async () => {
    const stream = new PassThrough();
    await formatter.format(stream, products, categories, brands);

    const resultString = await streamToBuffer(stream);
    const result = resultString.toString();

    expect(result).toContain("<categories>");
    expect(result).toContain('<category id="1" parentId="2">Обувь</category>');
    expect(result).toContain(
      '<category id="2" parentId="3">Одежда, обувь и аксессуары</category>',
    );
    expect(result).toContain(
      '<category id="3" parentId="">Все товары</category>',
    );
    expect(result).toContain("</categories>");
  });

  it("should include brands", async () => {
    const stream = new PassThrough();
    await formatter.format(stream, products, categories, brands);

    const resultString = await streamToBuffer(stream);
    const result = resultString.toString();

    expect(result).toContain("<brands>");
    expect(result).toContain('<brand id="1" url="">Adidas</brand>');
    expect(result).toContain('<brand id="2" url="url">Nike</brand>');
    expect(result).toContain('<brand id="3" url="">New Balance</brand>');
    expect(result).toContain("</brands>");
  });

  it("should include offers section", async () => {
    const stream = new PassThrough();
    await formatter.format(stream, products, categories, brands);

    const resultString = await streamToBuffer(stream);
    const result = resultString.toString();

    expect(result).toContain("<offers>");
    expect(result).toContain("</offers>");
  });

  it("should include product offers with correct structure", async () => {
    const stream = new PassThrough();
    await formatter.format(stream, products, categories, brands);

    const resultString = await streamToBuffer(stream);
    const result = resultString.toString();

    expect(result).toContain('<offer id="1111">');
    expect(result).toContain('<offer id="1112" group_id="1111">');
    expect(result).toContain("<name>Title</name>");
    expect(result).toContain("<price>19000</price>");
    expect(result).toContain("<oldprice>20000</oldprice>");
    expect(result).toContain("<currencyId>RUB</currencyId>");
    expect(result).toContain("<categoryId>1</categoryId>");
  });

  it("should include product description in CDATA", async () => {
    const stream = new PassThrough();
    await formatter.format(stream, products, categories, brands);

    const resultString = await streamToBuffer(stream);
    const result = resultString.toString();

    expect(result).toContain("<description>");
    expect(result).toContain("<![CDATA[Description]]>");
    expect(result).toContain("</description>");
  });

  it("should include product images", async () => {
    const stream = new PassThrough();
    await formatter.format(stream, products, categories, brands);

    const resultString = await streamToBuffer(stream);
    const result = resultString.toString();

    expect(result).toContain(
      "<picture>https://cdn.poizon.com/image1.png</picture>",
    );
    expect(result).toContain(
      "<picture>https://cdn.poizon.com/image2.png</picture>",
    );
  });

  it("should handle products without categories and brands", async () => {
    const stream = new PassThrough();
    await formatter.format(stream, products, undefined, undefined);

    const resultString = await streamToBuffer(stream);
    const result = resultString.toString();

    expect(result).not.toContain("<categories>");
    expect(result).not.toContain("<brands>");
    expect(result).toContain("<offers>");
  });

  it("should exclude products with price 0", async () => {
    const testProducts: Product[] = [
      {
        productId: 1,
        variantId: 111,
        title: "Free Product",
        description: "Test",
        categoryId: 1,
        price: 0,
        currency: Currency.RUB,
        vat: Vat.VAT_20,
      },
      {
        productId: 2,
        variantId: 222,
        title: "Paid Product",
        description: "Test",
        categoryId: 1,
        price: 1000,
        currency: Currency.RUB,
        vat: Vat.VAT_20,
      },
    ];

    const stream = new PassThrough();
    await formatter.format(stream, testProducts, categories, brands);

    const resultString = await streamToBuffer(stream);
    const result = resultString.toString();

    expect(result).not.toContain('<offer id="111">');
    expect(result).toContain('<offer id="222">');
    expect(result).toContain("<name>Paid Product</name>");
  });

  it("should include timeDelivery when provided", async () => {
    const testProducts: Product[] = [
      {
        productId: 1,
        variantId: 111,
        title: "Test",
        description: "Test",
        categoryId: 1,
        price: 1000,
        currency: Currency.RUB,
        vat: Vat.VAT_20,
        timeDelivery: {
          min: 3,
          max: 7,
        },
      },
    ];

    const stream = new PassThrough();
    await formatter.format(stream, testProducts, categories, brands);

    const resultString = await streamToBuffer(stream);
    const result = resultString.toString();

    expect(result).toContain(
      '<time-delivery min="3" max="7">3-7</time-delivery>',
    );
  });

  it("should handle products with parentId as group_id", async () => {
    const testProducts: Product[] = [
      {
        productId: 1,
        variantId: 111,
        title: "Parent",
        description: "Test",
        categoryId: 1,
        price: 1000,
        currency: Currency.RUB,
        vat: Vat.VAT_20,
      },
      {
        productId: 1,
        parentId: 111,
        variantId: 112,
        title: "Child",
        description: "Test",
        categoryId: 1,
        price: 1200,
        currency: Currency.RUB,
        vat: Vat.VAT_20,
      },
    ];

    const stream = new PassThrough();
    await formatter.format(stream, testProducts, categories, brands);

    const resultString = await streamToBuffer(stream);
    const result = resultString.toString();

    expect(result).toContain('<offer id="111">');
    expect(result).toContain('<offer id="112" group_id="111">');
  });

  it("should format date correctly in RFC3339 format", async () => {
    const stream = new PassThrough();
    await formatter.format(stream, products, categories, brands);

    const resultString = await streamToBuffer(stream);
    const result = resultString.toString();

    const dateMatch = result.match(/date="([^"]+)"/);
    expect(dateMatch).not.toBeNull();
    if (dateMatch) {
      const dateStr = dateMatch[1];
      expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
    }
  });
});
