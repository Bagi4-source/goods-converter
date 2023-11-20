import { expect, describe, it } from "vitest";

import { Formatters } from "../src";
import { categories, products } from "./constants";

describe("Excel formatter", () => {
  const formatter = new Formatters.ExcelFormatter();

  it("should export Excel data", async () => {
    const result = await formatter.format(products, categories);
    expect(result).toMatchSnapshot();
  });
});
