import { expect, describe, it } from "vitest";

import { Formatters } from "../src";
import { categories, products } from "./constants";

describe("CSV formatter", () => {
  const formatter = new Formatters.CSVFormatter();

  it("should export CSV data with split parameters", async () => {
    const resultSplit = await formatter.format(
      products,
      categories,
      undefined,
      {
        splitParams: true,
      },
    );
    expect(resultSplit).toMatchSnapshot();
  });

  it("should export CSV data without split parameters", async () => {
    const resultSplit = await formatter.format(
      products,
      categories,
      undefined,
      {
        splitParams: false,
      },
    );
    expect(resultSplit).toMatchSnapshot();

    const result = await formatter.format(products, categories);
    expect(result).toMatchSnapshot();
  });
});
