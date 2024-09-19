import { Formatters } from "src";
import { expect, describe, it, beforeEach, vi } from "vitest";

import { categories, products } from "./constants";
import { streamToBuffer } from "./utils/streamToBuffer";

import { PassThrough } from "stream";

describe("Insales formatter", () => {
  beforeEach(() => {
    // tell vitest we use mocked time
    vi.setSystemTime(new Date("2023-01-01T00:00:00Z"));
  });

  const formatter = new Formatters.InsalesFormatter();

  it("should export Insales data", async () => {
    const stream = new PassThrough();
    await formatter.format(stream, products, categories);
    const resultString = await streamToBuffer(stream);

    expect(resultString.toString()).toMatchSnapshot();
  });
});
