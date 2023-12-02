import { expect, describe, it, vi } from "vitest";

import { Formatters } from "../src";
import { categories, products } from "./constants";

describe("YML formatter", () => {
  const formatter = new Formatters.YMLFormatter();
  vi.useFakeTimers().setSystemTime(new Date("2020-01-01"));

  it("should export YML data", async () => {
    const result = await formatter.format(products, categories, {
      shopName: "Bagi4",
      companyName: "Bagi4",
    });

    expect(result).toMatchSnapshot();
  });
});
