# goods-exporter

[![npm version](https://img.shields.io/npm/v/goods-exporter)](https://www.npmjs.com/package/goods-exporter)
![npm](https://img.shields.io/npm/dm/goods-exporter)
![GitHub issues](https://img.shields.io/github/issues/Bagi4-source/goods-converter)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/Bagi4-source/goods-converter/blob/main/LICENSE)

A versatile JavaScript library for exporting goods data to various formats such as YML, CSV, and Excel. Simplify data
export tasks with ease.

[![Telegram](https://img.shields.io/badge/Telegram-%40goods_exporter-blue?logo=telegram)](https://t.me/+gGHmBC8VZ4BjYjZi)

## Features

- Export goods data to JSON, YML, CSV, and Excel formats.
- Easily integrate into your JavaScript projects.
- Compatible with Node.js version 16 and above.
- Comprehensive TypeScript type definitions included.
- Supports streams.

## Supported formats

- YML (Yandex Market Language)
- JSON
- SimpleJSON (grouped)
- CSV
- Excel
- TgShop
- Insales
- Tilda
- WooCommerce

## Installation

To use `goods-exporter` in your project, simply add it to your dependencies using npm or yarn:

```bash
npm install goods-exporter --save
# or
yarn add goods-exporter
```

## Quick start

```typescript
import { GoodsExporter, Product, Category, Formatters } from "../src";
import { PassThrough } from "stream";

// Create an instance of the GoodsExporter class.
const exporter = new GoodsExporter();

const products: Product[] = []; // Put your products;
const categories: Category[] = [{ id: 1, name: "Обувь" }];

// Call the data export method.
const stream = new PassThrough();
exporter.setExporter(() => stream);
exporter.setFormatter(new Formatters.YMLFormatter());
exporter.setTransformers([
  (products) => {
    return products.map((product) => ({
      ...product,
      price: product.price + 10000,
      images: product.images?.map((image) => image.replace("image", "pic")),
    }));
  },
]);
await exporter.export(products, categories);
```

## Example

```typescript
import fs from "fs"; // Import the 'fs' module for file writing.

// Create an instance of the GoodsExporter class.
const exporter = new GoodsExporter();

// Define an object 'transformers' that contains data transformation functions.
const transformers: Transformer[] = [
  (products) =>
    products.map((product) => ({
      ...product,
      price: product.price + 10000,
    })),
  (products) =>
    products.map((product) => ({
      ...product,
      images: product.images?.map((image) => image.replace("image", "pic")),
    })),
];

// Set the formatter for exporting data to YML.
exporter.setFormatter(new Formatters.YMLFormatter()); // or your own Formatter;

// Set transformers based on the specified keys.
exporter.setTransformers(transformers);

// Set an exporter that saves the data to the "output.yml" file.
exporter.setExporter(fs.createWriteStream("output.yml"));
await exporter.export(products, categories);
```

# Supported by [PoizonAPI](https://t.me/PoizonAPI)

[![PoizonAPI](https://i.ibb.co/HBbTpp0/Group-1.png)](https://t.me/PoizonAPI)
