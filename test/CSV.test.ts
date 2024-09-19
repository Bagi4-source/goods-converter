import { Formatters } from "src";
import { streamToBuffer } from "src/utils/streamToBuffer";
import { expect, describe, it } from "vitest";

import { categories, products } from "./constants";

describe("CSV formatter", () => {
  const formatter = new Formatters.CSVFormatter();

  it("should export CSV data", async () => {
    const result = await formatter.format(products, categories, undefined);
    const resultString = await streamToBuffer(result);

    expect(resultString.toString()).toMatchSnapshot();
  });
});
