import { XMLBuilder } from "fast-xml-parser";

import { type Product, type Category, type Brand } from "../../types";
import { writeWithDrain } from "../../utils";
import {
  Extension,
  type FormatterAbstract,
  type FormatterOptions,
} from "../formater.types";
import {
  AVITO_PRICE_LIMITS,
  isOneOf,
  type AvitoCategorySchema,
  type AvitoProductError,
  type AvitoValidationError,
} from "./shared";
import { TEMPLATE_REGISTRY } from "./templates";
import { type AvitoSneakersFormatterOptions } from "./types";

import { PassThrough, type Writable } from "stream";

interface AvitoImage {
  "@_url": string;
}

interface AvitoCdata {
  __cdata: string;
}

interface AvitoImages {
  Image: AvitoImage[];
}

interface AvitoAd {
  Id: number;
  Title: string;
  Description: AvitoCdata;
  Category: string;
  Price: number;
  Images: AvitoImages;
  GoodsType: string;
  Condition: string;
  AdType: string;
  Brand: string;
  Color: string;
  ColorName: string;
  ApparelType: string;
  Size: string;
  TargetAudience?: string;
}

type ImagesResult =
  | { kind: "ok"; images: AvitoImages }
  | { kind: "missing" }
  | { kind: "empty_array" }
  | { kind: "invalid_url" };

export class AvitoFormatter implements FormatterAbstract {
  public formatterName = "Avito";
  public fileExtension = Extension.XML;

  public async format(
    writableStream: Writable,
    products: Product[],
    _categories?: Category[],
    _brands?: Brand[],
    options?: FormatterOptions,
  ): Promise<void> {
    const avitoOptions = options?.avito;
    if (!avitoOptions) {
      throw new Error(
        "AvitoFormatter requires `options.avito` with category/goodsType/" +
          "condition/adType/apparelType",
      );
    }
    const schema = TEMPLATE_REGISTRY[avitoOptions.templateId];
    if (!schema) {
      throw new Error(
        `AvitoFormatter: templateId=${avitoOptions.templateId} не поддерживается. ` +
          `Доступные: ${Object.keys(TEMPLATE_REGISTRY).join(", ")}`,
      );
    }
    this.validateOptions(avitoOptions, schema);

    const result = new PassThrough();
    result.pipe(writableStream);

    const builder = new XMLBuilder({
      ignoreAttributes: false,
      cdataPropName: "__cdata",
      format: true,
      indentBy: "  ",
      suppressEmptyNode: true,
    });

    const resultWriter = writeWithDrain(result);

    await resultWriter('<?xml version="1.0" encoding="UTF-8"?>\n');
    await resultWriter('<Ads formatVersion="3" target="Avito.ru">\n');

    for (const product of products) {
      const built = this.buildAd(product, avitoOptions, schema);
      if (built.errors.length > 0) {
        const event: AvitoProductError = {
          productId: product.productId,
          errors: built.errors,
        };
        avitoOptions.onProductError?.(event);
        if (avitoOptions.failOnError) {
          // Без destroy() pipe (S3 / fs.WriteStream) успевает корректно
          // закрыть destination с partial-feed'ом ДО того, как promise
          // format() отклонится — consumer считает upload удачным. Node
          // pipe по умолчанию НЕ пробрасывает 'error' с source, поэтому
          // делаем explicit: отвязываем pipe, кидаем 'error' в
          // writableStream и убиваем внутренний PassThrough без ошибки
          // (свою уже выбросим throw'ом ниже).
          const err = new Error(
            `AvitoFormatter: товар productId=${product.productId} ` +
              `не прошёл валидацию (failOnError=true)`,
          );
          result.unpipe(writableStream);
          writableStream.destroy(err);
          result.destroy();
          throw err;
        }
        continue;
      }
      await resultWriter(this.indent(builder.build({ Ad: built.ad })) + "\n");
    }

    // .end(chunk) сам по себе не возвращает promise. Без await consumer'у,
    // который сразу после resolve format() начинает читать destination
    // (например, S3 multipart, где upload завершается лениво), может
    // достаться неполный фид. Дожидаемся 'finish' (или 'error') downstream'а.
    await new Promise<void>((resolve, reject) => {
      result.once("finish", () => {
        resolve();
      });
      result.once("error", reject);
      result.end("</Ads>\n");
    });
  }

  private validateOptions(
    options: AvitoSneakersFormatterOptions,
    schema: AvitoCategorySchema,
  ): void {
    if (!options.category?.trim()) {
      throw new Error(
        "AvitoFormatter: option `category` обязателен и не должен быть пустой строкой",
      );
    }
    this.requireEnumValue(
      "goodsType",
      options.goodsType,
      schema.goodsTypeValues,
    );
    this.requireEnumValue(
      "condition",
      options.condition,
      schema.conditionValues,
    );
    this.requireEnumValue("adType", options.adType, schema.adTypeValues);
    this.requireEnumValue(
      "apparelType",
      options.apparelType,
      schema.apparelTypeValues,
    );
    if (options.targetAudience !== undefined) {
      this.requireEnumValue(
        "targetAudience",
        options.targetAudience,
        schema.targetAudienceValues,
      );
    }
  }

  private requireEnumValue<T extends string>(
    name: string,
    value: string,
    allowed: readonly T[],
  ): void {
    if (!isOneOf(value, allowed)) {
      throw new Error(
        `AvitoFormatter: ${name}="${value}" не из справочника ` +
          `${allowed.join(", ")}`,
      );
    }
  }

  private buildAd(
    product: Product,
    options: AvitoSneakersFormatterOptions,
    schema: AvitoCategorySchema,
  ): { ad: AvitoAd; errors: AvitoValidationError[] } {
    const errors: AvitoValidationError[] = [];
    const paramIndex = this.buildParamIndex(product);

    if (
      typeof product.variantId !== "number" ||
      !Number.isInteger(product.variantId) ||
      product.variantId <= 0
    ) {
      errors.push({
        field: "Id",
        value: product.variantId,
        reason: "missing",
      });
    }

    const title = product.title?.trim() ?? "";
    this.validateTextField("Title", title, schema.textLimits.Title, errors);

    const description = product.description ?? "";
    this.validateTextField(
      "Description",
      description,
      schema.textLimits.Description,
      errors,
    );

    const price = product.price ?? 0;
    // Number.isFinite вместо `typeof === "number"` — последний пускает NaN
    // (`typeof NaN === "number"`), а NaN < min и NaN > max оба false по
    // IEEE-754, поэтому невалидная цена проходила бы валидацию и улетала в
    // <Price>NaN</Price>. Number.isFinite одной проверкой режет NaN, ±Infinity
    // и не-numbers.
    if (
      !Number.isFinite(price) ||
      price < AVITO_PRICE_LIMITS.min ||
      price > AVITO_PRICE_LIMITS.max
    ) {
      errors.push({
        field: "Price",
        value: price,
        reason: "out_of_range",
        expected: AVITO_PRICE_LIMITS,
      });
    }

    const imagesResult = this.getImages(product.images);
    if (imagesResult.kind !== "ok") {
      errors.push({
        field: "Images",
        value: product.images,
        reason: imagesResult.kind,
      });
    }

    const brand = product.vendor?.trim() ?? "";
    this.validateTextField("Brand", brand, schema.textLimits.Brand, errors);

    const rawColor = paramIndex.get("Color")?.trim() ?? "";
    if (!rawColor) {
      errors.push({ field: "Color", value: rawColor, reason: "missing" });
    } else if (!isOneOf(rawColor, schema.colorValues)) {
      errors.push({
        field: "Color",
        value: rawColor,
        reason: "invalid_enum",
        expected: schema.colorValues,
      });
    }

    const colorName = paramIndex.get("ColorName")?.trim() ?? "";
    this.validateTextField(
      "ColorName",
      colorName,
      schema.textLimits.ColorName,
      errors,
    );

    const size = this.getSize(product, paramIndex);
    if (!size) {
      errors.push({ field: "Size", value: size, reason: "missing" });
    }

    const ad: AvitoAd = {
      Id: typeof product.variantId === "number" ? product.variantId : 0,
      Title: title,
      Description: { __cdata: this.getSafeCdata(description) },
      Category: options.category,
      Price: price,
      Images: imagesResult.kind === "ok" ? imagesResult.images : { Image: [] },
      GoodsType: options.goodsType,
      Condition: options.condition,
      AdType: options.adType,
      Brand: brand,
      Color: rawColor,
      ColorName: colorName,
      ApparelType: options.apparelType,
      Size: size ?? "",
    };

    if (options.targetAudience) {
      ad.TargetAudience = options.targetAudience;
    }

    return { ad, errors };
  }

  private validateTextField(
    field: AvitoValidationError["field"],
    value: string,
    limits: { readonly min: number; readonly max: number },
    errors: AvitoValidationError[],
  ): void {
    if (value.length === 0) {
      errors.push({ field, value, reason: "missing" });
    } else if (value.length < limits.min) {
      errors.push({ field, value, reason: "too_short", expected: limits });
    } else if (value.length > limits.max) {
      errors.push({ field, value, reason: "too_long", expected: limits });
    }
  }

  private getImages(images?: string[]): ImagesResult {
    if (images === undefined) return { kind: "missing" };
    if (!Array.isArray(images) || images.length === 0) {
      return { kind: "empty_array" };
    }
    const valid: AvitoImage[] = [];
    for (const raw of images) {
      if (typeof raw !== "string") continue;
      const url = raw.trim();
      if (url.length === 0 || !this.isValidUrl(url)) continue;
      valid.push({ "@_url": url });
    }
    if (valid.length === 0) return { kind: "invalid_url" };
    return { kind: "ok", images: { Image: valid } };
  }

  private getSize(
    product: Product,
    paramIndex: Map<string, string>,
  ): string | undefined {
    const paramSize = paramIndex.get("Size")?.trim();
    if (paramSize) return paramSize;

    const size = product.sizes?.find((item) => item.value.trim().length > 0);
    if (!size) return undefined;
    // Пустой delimiter ломает split('') (разбирает строку посимвольно).
    const delimiter = size.delimiter || "/";
    return this.getFirstDelimitedValue(size.value, delimiter);
  }

  /**
   * Index по `product.params` + `product.properties`: ключ — exact (case-
   * sensitive) Avito tag, значение — raw из feed'а. mapping-transformer на
   * предыдущем этапе обязан положить значения под exact tag-имена
   * (`Color`/`Size`/`ColorName`), иначе формattер сюда не попадёт. `params`
   * имеет приоритет над `properties`, но только при непустом значении —
   * empty/whitespace в params трактуется как «не задано» и не шитит ключ от
   * fallback'а в properties (иначе плейсхолдер из mapping'а перекрыл бы
   * реальное значение и валидатор зарепортил бы missing).
   */
  private buildParamIndex(product: Product): Map<string, string> {
    const index = new Map<string, string>();
    const lists = [product.params, product.properties];
    for (const list of lists) {
      if (!list) continue;
      for (const param of list) {
        if (typeof param?.key !== "string") continue;
        if (typeof param?.value !== "string") continue;
        if (param.value.trim().length === 0) continue;
        if (!index.has(param.key)) index.set(param.key, param.value);
      }
    }
    return index;
  }

  private getFirstDelimitedValue(value: string, delimiter: string): string {
    const [firstValue] = value.split(delimiter);
    return firstValue.trim();
  }

  /**
   * `]]>` нельзя экранировать внутри CDATA (XML 1.0 §2.7 запрещает nesting),
   * поэтому канонический трюк — разрыв секции: закрываем `]]>` и тут же
   * открываем новый `<![CDATA[>`. См. https://www.w3.org/TR/xml/#sec-cdata-sect
   */
  private getSafeCdata(value: string): string {
    if (!value.includes("]]>")) return value;
    return value.replaceAll("]]>", "]]]]><![CDATA[>");
  }

  /**
   * WHATWG URL парсит `"https:image1"` как `https://image1/` — без буквальной
   * `//` после схемы degenerate URLs проходят. Поэтому проверяем префикс
   * regex'ом отдельно, плюс требуем непустой `host`.
   */
  private isValidUrl(value: string): boolean {
    if (!/^https?:\/\//i.test(value)) return false;
    try {
      const url = new URL(value);
      return (
        (url.protocol === "http:" || url.protocol === "https:") &&
        url.host.length > 0
      );
    } catch {
      return false;
    }
  }

  private indent(value: string): string {
    const trimmed = value.trimEnd();
    if (trimmed.length === 0) return trimmed;
    // split/join вместо regex /^/gm: zero-width match в replace eagerly
    // аллоцирует массив всех позиций матчей плюс substring между ними,
    // на потоке тысяч ad'ов это лишний overhead.
    return "  " + trimmed.split("\n").join("\n  ");
  }
}
