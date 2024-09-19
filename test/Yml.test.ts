import { Formatters } from "src";
import { expect, describe, it, vi } from "vitest";

import { brands, categories, products } from "./constants";
import { streamToBuffer } from "./utils/streamToBuffer";

import { afterEach } from "node:test";

describe("YML formatter", () => {
  const formatter = new Formatters.YMLFormatter();

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers();
  });

  it("should export YML data", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-01-01T00:00:00Z"));

    const result = await formatter.format(products, categories, brands, {
      shopName: "Bagi4",
      companyName: "Bagi4",
    });

    const resultString = await streamToBuffer(result);

    expect(resultString.toString()).toMatchSnapshot();
  });
});
