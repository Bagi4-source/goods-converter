import { expect, describe, it } from "vitest";

import { Formatters } from "../src";
import { brands, categories, products } from "./constants";
import { streamToBuffer } from "../src/utils/streamToBuffer";

describe("Simple JSON formatter", () => {
  const formatter = new Formatters.SimpleJSONFormatter();

  it("should export Simple JSON data", async () => {
    const result = await formatter.format(products, categories, brands);
    const resultString = await streamToBuffer(result);

    expect(resultString.toString()).toMatchSnapshot();
  });
});
