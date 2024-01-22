import { expect, describe, it, vi } from "vitest";

import { Formatters } from "../src";
import { brands, categories, products } from "./constants";

describe("JSON formatter", () => {
  const formatter = new Formatters.JSONFormatter();
  vi.useFakeTimers().setSystemTime(new Date("2020-01-01"));

  it("should export JSON data", async () => {
    const result = await formatter.format(products, categories, brands);

    expect(result).toMatchSnapshot();
  });
});
