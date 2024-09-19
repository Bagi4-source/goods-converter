import { Formatters } from "src";
import { expect, describe, it } from "vitest";

import { brands, categories, products } from "./constants";
import { streamToBuffer } from "./utils/streamToBuffer";

import { PassThrough } from "stream";

describe("Simple JSON formatter", () => {
  const formatter = new Formatters.SimpleJSONFormatter();

  it("should export Simple JSON data", async () => {
    const stream = new PassThrough();
    await formatter.format(stream, products, categories, brands);
    const resultString = await streamToBuffer(stream);

    expect(resultString.toString()).toMatchSnapshot();
  });
});
