import { expect, describe, it } from "vitest";

import { Formatters } from "../src";
import { categories, products } from "./constants";

describe("CSV formatter", () => {
  const formatter = new Formatters.CSVFormatter();

  it("should export CSV data", async () => {
    const result = await formatter.format(products, categories, undefined);
    expect(result).toMatchSnapshot();
  });
});
