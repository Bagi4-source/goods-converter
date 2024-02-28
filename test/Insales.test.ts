import { expect, describe, it } from "vitest";

import { Formatters } from "../src";
import { categories, products } from "./constants";

describe.skip("Insales formatter", () => {
  const formatter = new Formatters.InsalesFormatter();

  it("should export Insales data", async () => {
    const result = await formatter.format(products, categories);
    expect(result).toMatchSnapshot();
  });
});
