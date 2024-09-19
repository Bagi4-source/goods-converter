import { Formatters } from "src";
import { expect, describe, it } from "vitest";

import { brands, categories, products } from "./constants";
import { streamToBuffer } from "./utils/streamToBuffer";

describe("JSON formatter", () => {
  const formatter = new Formatters.JSONFormatter();

  it("should export JSON data", async () => {
    const result = await formatter.format(products, categories, brands);

    const resultString = await streamToBuffer(result);

    expect(resultString.toString()).toMatchSnapshot();
  });
});
