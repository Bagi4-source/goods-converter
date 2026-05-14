import {
  type AvitoFieldSnapshot,
  type AvitoTemplateSnapshot,
  isAvitoTemplateSnapshot,
} from "src/formatter/avito/snapshotShape";
import { TEMPLATE_REGISTRY } from "src/formatter/avito/templates";
import { type SupportedTemplateId } from "src/formatter/avito/types";
import { describe, expect, it } from "vitest";

import fs from "fs";
import path from "path";

/**
 * Drift-чек между захардкоженными per-template `SCHEMA` (в `templates/<id>.ts`)
 * и snapshot'ами фактической схемы Avito (получаются `pnpm schema:fetch`
 * через HTML-парсинг страницы документации).
 *
 * Snapshot — source of truth. Если этот тест падает → надо привести
 * соответствующий `templates/<id>.ts` в соответствие со snapshot'ом, либо
 * если snapshot сам устарел — запустить `pnpm schema:fetch` для обновления.
 *
 * При отсутствии snapshot'а тест в локальной разработке skip'ается, а в CI
 * (`process.env.CI`) — фейлится, иначе drift-чек молча деградирует в no-op.
 */

const SNAPSHOTS_DIR = path.join(
  process.cwd(),
  "src",
  "formatter",
  "avito",
  "snapshots",
);

function loadSnapshot(templateId: number): AvitoTemplateSnapshot | null {
  const file = path.join(SNAPSHOTS_DIR, `avito-schema-${templateId}.json`);
  if (!fs.existsSync(file)) return null;
  const parsed: unknown = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!isAvitoTemplateSnapshot(parsed)) {
    throw new Error(
      `Snapshot ${file} повреждён или устарел — перезапустите pnpm schema:fetch`,
    );
  }
  return parsed;
}

function allFields(snap: AvitoTemplateSnapshot): AvitoFieldSnapshot[] {
  return snap.groups.flatMap((g) => g.fields);
}

function extractEnumValues(snap: AvitoTemplateSnapshot, tag: string): string[] {
  const field = allFields(snap).find((f) => f.tag === tag);
  // Возвращаем `[]` вместо throw'а — vitest'овский toEqual покажет полный
  // diff `Expected: [...], Received: []` и сразу укажет: snapshot устарел /
  // тег переименован / external-values fetch упал. Throw скрывал бы реальную
  // причину за stack trace внутри helper'а.
  if (!field) return [];
  if (field.values && field.values.length > 0) {
    return field.values.map((v) => v.value);
  }
  return snap.externalValues[tag] ?? [];
}

function extractRequiredTags(snap: AvitoTemplateSnapshot): string[] {
  return allFields(snap)
    .filter((f) => f.required === true)
    .map((f) => f.tag)
    .sort();
}

// Compile-time check: TEMPLATE_IDS должен покрывать весь SupportedTemplateId.
// При добавлении нового id в union, _MissingIds = новый id, _COVERAGE_CHECK
// перестанет компилироваться → разработчику нужно дописать сюда.
const TEMPLATE_IDS: SupportedTemplateId[] = [100368, 100388];
type _MissingIds = Exclude<SupportedTemplateId, (typeof TEMPLATE_IDS)[number]>;
const _COVERAGE_CHECK: _MissingIds extends never ? true : never = true;
void _COVERAGE_CHECK;

if (Object.keys(TEMPLATE_REGISTRY).length !== TEMPLATE_IDS.length) {
  throw new Error(
    `TEMPLATE_IDS (${TEMPLATE_IDS.length}) != TEMPLATE_REGISTRY (${
      Object.keys(TEMPLATE_REGISTRY).length
    }): обнови оба.`,
  );
}

describe.each(TEMPLATE_IDS)(
  "template %i sync with Avito documentation snapshot",
  (templateId) => {
    const snap = loadSnapshot(templateId);
    const schema = TEMPLATE_REGISTRY[templateId];

    if (!snap) {
      if (process.env.CI) {
        it(`snapshot avito-schema-${templateId}.json отсутствует в CI`, () => {
          throw new Error(
            `Snapshot не найден. Запусти \`pnpm schema:fetch\` и закоммить.`,
          );
        });
      } else {
        it.skip(`snapshot avito-schema-${templateId}.json не найден — запусти pnpm schema:fetch`, () => {});
      }
      return;
    }

    it("colorValues match Color enum from Avito", () => {
      expect([...schema.colorValues].sort()).toEqual(
        extractEnumValues(snap, "Color").sort(),
      );
    });

    it("conditionValues match Condition enum from Avito", () => {
      expect([...schema.conditionValues].sort()).toEqual(
        extractEnumValues(snap, "Condition").sort(),
      );
    });

    it("adTypeValues match AdType enum from Avito", () => {
      expect([...schema.adTypeValues].sort()).toEqual(
        extractEnumValues(snap, "AdType").sort(),
      );
    });

    it("goodsTypeValues match GoodsType enum from Avito", () => {
      expect([...schema.goodsTypeValues].sort()).toEqual(
        extractEnumValues(snap, "GoodsType").sort(),
      );
    });

    it("apparelTypeValues match ApparelType enum from Avito", () => {
      expect([...schema.apparelTypeValues].sort()).toEqual(
        extractEnumValues(snap, "ApparelType").sort(),
      );
    });

    it("targetAudienceValues match TargetAudience enum from Avito", () => {
      expect([...schema.targetAudienceValues].sort()).toEqual(
        extractEnumValues(snap, "TargetAudience").sort(),
      );
    });

    it("requiredFields match Avito required flags", () => {
      expect([...schema.requiredFields].sort()).toEqual(
        extractRequiredTags(snap),
      );
    });
  },
);
