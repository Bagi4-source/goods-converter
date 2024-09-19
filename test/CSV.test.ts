import { Formatters } from "src";
import { expect, describe, it } from "vitest";

import { categories, products } from "./constants";
import { streamToBuffer } from "./utils/streamToBuffer";

import { PassThrough } from "stream";

describe("CSV formatter", () => {
  const formatter = new Formatters.CSVFormatter();

  it("should export CSV data", async () => {
    const stream = new PassThrough();
    await formatter.format(stream, products, categories, undefined);
    const resultString = await streamToBuffer(stream);

    expect(resultString.toString()).toMatchSnapshot();
  });
});
