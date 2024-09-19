import { Formatters } from "src";
import { expect, describe, it, beforeEach, vi, afterEach } from "vitest";

import { categories, products } from "./constants";
import { streamToBuffer } from "./utils/streamToBuffer";

describe("TgShop formatter", () => {
  beforeEach(() => {
    // tell vitest we use mocked time
    vi.setSystemTime(new Date("2023-01-01T00:00:00Z"));
  });

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers();
  });

  const formatter = new Formatters.TgShopFormatter();

  it("should export TgShop data", async () => {
    const result = await formatter.format(products, categories);
    const resultString = await streamToBuffer(result);

    expect(resultString.toString()).toMatchSnapshot();
  });
});
