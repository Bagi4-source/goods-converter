/**
 * Shape для JSON-snapshot'ов схемы Avito autoload-template'ов (файлы
 * `snapshots/avito-schema-<id>.json`). Используется и в `scripts/fetch-avito-
 * schema.ts` (запись), и в `test/avitoSchemaSync.spec.ts` (чтение и drift-
 * проверка против `templates/<id>.ts`). Держим один source-of-truth, иначе
 * accidental drift между деклярациями.
 */

export interface AvitoFieldSnapshot {
  id?: number;
  tag: string;
  label?: string;
  description?: string;
  example?: string;
  required?: boolean;
  type?: string;
  values?: Array<{ value: string }>;
  values_link?: string;
  values_title?: string;
  dependency?: string[];
}

export interface AvitoTemplateSnapshot {
  id: number;
  fetchedAt?: string;
  nodeName?: string;
  groups: Array<{ name: string; fields: AvitoFieldSnapshot[] }>;
  externalValues: Record<string, string[]>;
}

/**
 * Runtime type-guard для JSON.parse результата. Заменяет `as
 * AvitoTemplateSnapshot`-cast — при битом/устаревшем snapshot'е получаем
 * явную ошибку с указанием на конкретный файл, а не cryptic NPE при первом
 * обращении к свойству.
 */
export function isAvitoTemplateSnapshot(
  value: unknown,
): value is AvitoTemplateSnapshot {
  if (typeof value !== "object" || value === null) return false;
  if (!("id" in value) || typeof value.id !== "number") return false;
  if (!("groups" in value) || !Array.isArray(value.groups)) return false;
  if (!("externalValues" in value)) return false;
  const ext = value.externalValues;
  if (typeof ext !== "object" || ext === null) return false;
  return true;
}
