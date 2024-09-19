import { Formatters } from "src";
import { streamToBuffer } from "src/utils/streamToBuffer";
import { expect, describe, it } from "vitest";

import { categories, products } from "./constants";

describe("Tilda formatter", () => {
  const formatter = new Formatters.TildaFormatter();

  it("should export Tilda csv data", async () => {
    const result = await formatter.format(products, categories);
    const resultString = await streamToBuffer(result);

    expect(resultString.toString()).toMatchSnapshot();
  });
});
