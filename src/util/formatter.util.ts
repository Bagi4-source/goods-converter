import { type FormatterOptions } from "../formatter";
import { type Product } from "../types";

const getParams = (
  product: Product,
  option?: FormatterOptions,
): Record<string, string> => {
  const params: Record<string, string> = {};

  if (option?.splitParams === false) {
    return params;
  }

  product.params?.forEach(
    ({ key, value }) => (params[`Param [${key}]`] = value),
  );
  return params;
};

const getProperties = (
  product: Product,
  option?: FormatterOptions,
): Record<string, string> => {
  const properties: Record<string, string> = {};

  if (option?.splitParams === false) {
    return properties;
  }

  product.properties?.forEach(
    ({ key, value }) => (properties[`Property [${key}]`] = value),
  );
  return properties;
};

const getSizes = (
  product: Product,
  option?: FormatterOptions,
): Record<string, string> => {
  const sizes: Record<string, string> = {};
  product.sizes?.forEach(
    ({ name, value }) => (sizes[`Size [${name}]`] = value),
  );
  return sizes;
};

export const UTILS = {
  getSizes,
  getParams,
  getProperties,
};
