import { type AvitoCategorySchema } from "../shared";
import { type SupportedTemplateId } from "../types";
import { SCHEMA as SCHEMA_100368 } from "./100368";
import { SCHEMA as SCHEMA_100388 } from "./100388";

/**
 * Реестр всех поддерживаемых Avito autoload-template'ов. Используется
 * `AvitoFormatter` для lookup'а схемы по `options.templateId`.
 *
 * При добавлении нового template'а:
 *   1. Положи `<id>.ts` рядом с этим файлом.
 *   2. Добавь сюда.
 *   3. Расширь `SupportedTemplateId` в `../types.ts`.
 */
export const TEMPLATE_REGISTRY: Record<
  SupportedTemplateId,
  AvitoCategorySchema
> = {
  100368: SCHEMA_100368,
  100388: SCHEMA_100388,
};
