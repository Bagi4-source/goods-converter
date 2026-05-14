import { type AvitoCategorySchema } from "../shared";
import { buildSneakersSchema } from "./sneakersCommon";

/**
 * Avito autoload template 100388 — «Кроссовки и кеды» (женская обувь).
 *
 * Per-template поля (templateId, nodeName, goodsTypeValues, apparelTypeValues)
 * задаются здесь; остальные enum'ы и текстовые лимиты — общие для всех
 * sneakers-template'ов, см. `./sneakersCommon`. Sync с snapshot'ом проверяет
 * `test/avitoSchemaSync.spec.ts`.
 */
export const SCHEMA: AvitoCategorySchema = buildSneakersSchema({
  templateId: 100388,
  nodeName: "Кроссовки и кеды",
  goodsTypeValues: ["Женская обувь"],
  apparelTypeValues: ["Кроссовки и кеды"],
});
