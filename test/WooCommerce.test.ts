import { Formatters } from "src";
import { expect, describe, it } from "vitest";

import { categories, products } from "./constants";
import { streamToBuffer } from "./utils/streamToBuffer";

import { PassThrough } from "stream";

describe("WooCommerce formatter", () => {
  const formatter: any = new Formatters.WooCommerceFormatter();

  it("test formatKeyAttribute", () => {
    const key = "This, is; a very long key that exceeds 28 characters";
    const formattedKey = formatter.formatKeyAttribute(key);
    expect(formattedKey).toBe("This is a very long key ...");
  });

  it("test formatValueAttribute", () => {
    const value = "value, with; special, characters;";
    const formattedValue = formatter.formatValueAttribute(value);
    expect(formattedValue).toBe("value with special characters");
  });

  it("test format params and properties", () => {
    const formattedProducts = formatter.formatProducts(products);
    expect(formattedProducts[0].params).toEqual([
      { key: "param1", value: "v1" },
      { key: "param2", value: "v2" },
    ]);
    expect(formattedProducts[0].properties).toEqual([
      { key: "prop1", value: "v1" },
      { key: "prop2", value: "v2" },
    ]);
  });

  it("test createAttribute", () => {
    const attribute = formatter.createAttribute({
      name: "Size",
      id: 1,
      values: "Large",
      visible: 1,
      global: 0,
    });

    expect(attribute).toEqual({
      "Attribute 1 name": "Size",
      "Attribute 1 value(s)": "Large",
      "Attribute 1 visible": 1,
      "Attribute 1 global": 0,
    });
  });

  it("test extractAttributes", () => {
    const { params, properties } = formatter.extractAttributes(products);
    expect(params.size).toBe(2);
    expect(properties.size).toBe(2);
  });

  it("test removeVisibleFromAttributes", () => {
    const params = {
      "Attribute 1 visible": 1,
      "Attribute 1 name": "Size",
    };

    formatter.removeVisibleFromAttributes(params);
    expect(params).toEqual({
      "Attribute 1 visible": "",
      "Attribute 1 name": "Size",
    });
  });

  it("should export WooCommerce data", async () => {
    const stream = new PassThrough();
    await formatter.format(stream, products, categories, undefined);
    const resultString = await streamToBuffer(stream);

    expect(resultString.toString()).toMatchSnapshot();
  });
});
