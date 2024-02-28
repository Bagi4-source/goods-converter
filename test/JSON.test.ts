import { expect, describe, it } from "vitest";

import { Formatters } from "../src";
import { brands, categories, products } from "./constants";

describe("JSON formatter", () => {
  const formatter = new Formatters.JSONFormatter();

  it("should export JSON data", async () => {
    const result = await formatter.format(products, categories, brands);

    expect(result).toMatchSnapshot();
  });
});
