import { expect, describe, it } from "vitest";

import { Formatters } from "../src";
import { categories, products } from "./constants";

describe("Tilda formatter", () => {
  const formatter = new Formatters.TildaFormatter();

  it("should export Tilda csv data", async () => {
    const result = await formatter.format(products, categories);
    expect(result).toMatchSnapshot();
  });
});
