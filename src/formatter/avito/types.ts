import { type AvitoProductError } from "./shared";

/**
 * Avito autoload template'ы, которые сейчас поддерживает библиотека.
 * Каждое значение соответствует файлу `templates/<id>.ts` и snapshot'у
 * `schemas/snapshots/avito-schema-<id>.json`. Чтобы добавить новый template:
 *
 *   1. `pnpm schema:fetch` (после правки `TEMPLATE_IDS` в скрипте).
 *   2. Создать `templates/<id>.ts` со схемой.
 *   3. Прописать в `templates/index.ts` (TEMPLATE_REGISTRY).
 *   4. Расширить union ниже.
 */
export type SupportedTemplateId = 100368 | 100388;

/**
 * Опции форматтера для категорий типа «sneakers» в Avito (обувь, кеды,
 * кроссовки, слипоны — все template'ы со схемой Brand/ColorName/Size/
 * GoodsType/ApparelType/Condition/AdType). Если когда-нибудь добавится
 * принципиально другая категория (украшения с Insert/Metal, мебель с
 * Width/Height/Depth) — у неё будет свой Options-тип.
 *
 * Required-поля schemы template'а должны быть переданы caller'ом — форматтер
 * сам ничего не угадывает. Невалидный товар не попадёт в XML, репортится
 * через `onProductError`.
 */
export interface AvitoSneakersFormatterOptions {
  /**
   * Avito autoload template ID. Определяет какой набор enum'ов и required-
   * полей будет применён. См. `SupportedTemplateId`.
   */
  templateId: SupportedTemplateId;
  /** Категория в таксономии Avito, например "Одежда, обувь, аксессуары". */
  category: string;
  /** Тип товара. Из `SCHEMA.goodsTypeValues` template'а (см. templateId). */
  goodsType: string;
  /** Состояние товара. Из `SCHEMA.conditionValues`. */
  condition: string;
  /** Тип объявления. Из `SCHEMA.adTypeValues` (внимание: NBSP в значениях!). */
  adType: string;
  /** Вид обуви. Из `SCHEMA.apparelTypeValues` template'а. */
  apparelType: string;
  /** Целевая аудитория (тип покупателя). Опционально. */
  targetAudience?: string;
  /**
   * Если true — на первом же невалидном товаре `format(...)` уничтожает
   * stream через `destroy(err)` и бросает ту же ошибку (consumer pipe
   * получит 'error', а не корректное закрытие partial-feed'а). По умолчанию
   * false: невалидные товары пропускаются и репортятся через `onProductError`.
   */
  failOnError?: boolean;
  /** Callback на каждый невалидный товар. */
  onProductError?: (event: AvitoProductError) => void;
}
