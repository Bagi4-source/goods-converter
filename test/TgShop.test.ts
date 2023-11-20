import { expect, describe, it } from "vitest";

import { Formatters } from "../src";
import { categories, products } from "./constants";

describe("TgShop formatter", () => {
  const formatter = new Formatters.TgShopFormatter();

  it("should export TgShop data", async () => {
    const result = await formatter.format(products, categories);
    expect(result).toMatchSnapshot();
  });
});
