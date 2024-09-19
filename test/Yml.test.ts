import { Formatters } from "src";
import { expect, describe, it, vi, beforeEach } from "vitest";

import { brands, categories, products } from "./constants";
import { streamToBuffer } from "./utils/streamToBuffer";

import { PassThrough } from "stream";

describe("YML formatter", () => {
  const formatter = new Formatters.YMLFormatter();

  beforeEach(() => {
    vi.setSystemTime(new Date("2023-01-01T00:00:00Z"));
  });

  it("should export YML data", async () => {
    const stream = new PassThrough();
    const result = await formatter.format(
      stream,
      products,
      categories,
      brands,
      {
        shopName: "Bagi4",
        companyName: "Bagi4",
      },
    );

    const resultString = await streamToBuffer(stream);

    expect(resultString.toString()).toMatchSnapshot();
  });
});
