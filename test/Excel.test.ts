import { expect, describe, it } from "vitest";

import { Formatters } from "../src";
import { categories, products } from "./constants";
import { hashStream } from "./util";

describe.skip("Excel formatter", () => {
  const formatter = new Formatters.ExcelFormatter();

  it("should export Excel data", async () => {
    const result = await formatter.format(products, categories);
    expect(await hashStream(result)).toMatchSnapshot();
  });
});
