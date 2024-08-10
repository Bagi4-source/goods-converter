import { expect, describe, it } from "vitest";

import { Formatters } from "../src";
import { streamToBuffer } from "../src/utils/streamToBuffer";
import { categories, products } from "./constants";

describe.skip("TgShop formatter", () => {
  const formatter = new Formatters.TgShopFormatter();

  it("should export TgShop data", async () => {
    const result = await formatter.format(products, categories);
    const resultString = await streamToBuffer(result);

    expect(resultString.toString()).toMatchSnapshot();
  });
});
