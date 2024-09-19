import { Formatters } from "src";
import { expect, describe, it } from "vitest";

import { categories, products } from "./constants";
import { streamToBuffer } from "./utils/streamToBuffer";

import { PassThrough } from "stream";

describe("Tilda formatter", () => {
  const formatter = new Formatters.TildaFormatter();

  it("should export Tilda csv data", async () => {
    const stream = new PassThrough();
    await formatter.format(stream, products, categories);
    const resultString = await streamToBuffer(stream);

    expect(resultString.toString()).toMatchSnapshot();
  });
});
