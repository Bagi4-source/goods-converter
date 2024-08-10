import { expect, describe, it } from "vitest";

import { Formatters } from "../src";
import { categories, products } from "./constants";
import { streamToBuffer } from "../src/utils/streamToBuffer";

describe.skip("Insales formatter", () => {
  const formatter = new Formatters.InsalesFormatter();

  it("should export Insales data", async () => {
    const result = await formatter.format(products, categories);
    const resultString = await streamToBuffer(result);

    expect(resultString.toString()).toMatchSnapshot();
  });
});
