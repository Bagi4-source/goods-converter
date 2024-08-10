import { expect, describe, it } from "vitest";

import { Formatters } from "../src";
import { streamToBuffer } from "../src/utils/streamToBuffer";
import { categories, products } from "./constants";

describe.skip("Excel formatter", () => {
  const formatter = new Formatters.ExcelFormatter();

  it("should export Excel data", async () => {
    const result = await formatter.format(products, categories);
    const resultString = await streamToBuffer(result);

    expect(resultString.toString()).toMatchSnapshot();
  });
});
