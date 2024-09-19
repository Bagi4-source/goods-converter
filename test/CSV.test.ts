import { Formatters } from "src";
import { expect, describe, it } from "vitest";

import { categories, products } from "./constants";
import { streamToBuffer } from "./utils/streamToBuffer";

describe("CSV formatter", () => {
  const formatter = new Formatters.CSVFormatter();

  it("should export CSV data", async () => {
    const result = await formatter.format(products, categories, undefined);
    const resultString = await streamToBuffer(result);

    expect(resultString.toString()).toMatchSnapshot();
  });
});
