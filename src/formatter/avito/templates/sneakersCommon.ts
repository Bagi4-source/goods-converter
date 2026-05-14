import { type AvitoCategorySchema } from "../shared";

/**
 * Поля и enum'ы, общие для всех sneakers-template'ов Avito autoload (100368 —
 * мужская обувь, 100388 — женская). Различаются между category-template'ами
 * только `templateId`, `nodeName`, `goodsTypeValues`, `apparelTypeValues` —
 * это передаётся в `buildSneakersSchema` каждым `<id>.ts`. Sync с snapshot'ом
 * проверяет `test/avitoSchemaSync.spec.ts`; значения тут должны байт-в-байт
 * совпадать с `src/formatter/avito/snapshots/avito-schema-<id>.json` (включая
 * NBSP в `SNEAKERS_AD_TYPE_VALUES`).
 */

const SNEAKERS_REQUIRED_FIELDS = [
  "AdType",
  "Address",
  "ApparelType",
  "Brand",
  "Category",
  "Color",
  "ColorName",
  "Condition",
  "Description",
  "GoodsType",
  "Id",
  "Images",
  "Size",
  "Title",
] as const;

const SNEAKERS_COLOR_VALUES = [
  "Красный",
  "Белый",
  "Розовый",
  "Бордовый",
  "Синий",
  "Жёлтый",
  "Голубой",
  "Фиолетовый",
  "Оранжевый",
  "Разноцветный",
  "Серый",
  "Бежевый",
  "Чёрный",
  "Коричневый",
  "Зелёный",
  "Серебряный",
  "Золотой",
] as const;

const SNEAKERS_CONDITION_VALUES = [
  "Новое с биркой",
  "Отличное",
  "Хорошее",
  "Удовлетворительное",
] as const;

// Avito использует NBSP (U+00A0) между словами этих строк. Обычный пробел
// Avito отвергает; см. AvitoCategorySchema.adTypeValues JSDoc и regress-тест
// в test/Avito.test.ts. Пишем через \u00A0-escape, чтобы (а) eslint
// no-irregular-whitespace не ругался на литеральный NBSP, (б) случайный
// find&replace в IDE не «починил» NBSP на обычный пробел.
const SNEAKERS_AD_TYPE_VALUES = [
  "Товар приобретен на\u00A0продажу",
  "Товар от\u00A0производителя",
] as const;

const SNEAKERS_TARGET_AUDIENCE_VALUES = [
  "Частные лица",
  "Бизнес",
  "Частные лица и бизнес",
] as const;

const SNEAKERS_TEXT_LIMITS = {
  Title: { min: 1, max: 50 },
  Description: { min: 1, max: 7500 },
  Brand: { min: 1, max: 50 },
  ColorName: { min: 1, max: 50 },
} as const satisfies AvitoCategorySchema["textLimits"];

export type SneakersTemplateOverrides = Pick<
  AvitoCategorySchema,
  "templateId" | "nodeName" | "goodsTypeValues" | "apparelTypeValues"
>;

/**
 * Собирает `AvitoCategorySchema` для sneakers-template'а: per-template поля
 * передаются в `overrides`, всё остальное берётся из общих констант.
 */
export function buildSneakersSchema(
  overrides: SneakersTemplateOverrides,
): AvitoCategorySchema {
  return {
    ...overrides,
    requiredFields: SNEAKERS_REQUIRED_FIELDS,
    colorValues: SNEAKERS_COLOR_VALUES,
    conditionValues: SNEAKERS_CONDITION_VALUES,
    adTypeValues: SNEAKERS_AD_TYPE_VALUES,
    targetAudienceValues: SNEAKERS_TARGET_AUDIENCE_VALUES,
    textLimits: SNEAKERS_TEXT_LIMITS,
  };
}
