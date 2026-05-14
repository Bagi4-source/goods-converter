/**
 * Получает схемы Avito autoload-template'ов парсингом публичной документации
 * (`https://www.avito.ru/autoload/documentation/templates/{id}?fileFormat=xml`)
 * и сохраняет JSON-снапшоты в `src/formatter/avito/snapshots/`.
 *
 * Подход без OAuth: страница документации публична, не требует авторизации.
 * Парсим встроенный JSON из HTML (Avito хранит схему в `<script>` теге как
 * сериализованный объект), достаём поля, required-флаги, enum-значения,
 * лимиты. Аналог в принципе использует и WordPress-плагин «XML for Avito»
 * (с ручным циклом обновлений).
 *
 * Snapshots — source of truth для `test/avitoSchemaSync.spec.ts`: тест следит
 * чтобы захардкоженные константы в `templates/<id>.ts` им соответствовали.
 *
 * ## Режимы
 *
 * - default (без флагов) — fetch + overwrite snapshot файлов.
 * - `--check` — fetch + сравнение с существующими snapshot'ами; exit 1 при
 *   drift'е. Предназначено для CI / nightly cron. В этом режиме любой сбой
 *   external-values fetch'а — фатален, иначе drift был бы false-positive'ом
 *   (network blip → неполный fresh snapshot → diff с полным existing).
 *
 * ## Хрупкость
 *
 * Парсер регексом ищет маркер `"node_name":"` в HTML и поднимается до
 * охватывающего `{...}` объекта. Если Avito переделает вёрстку доки и
 * поменяет имя маркера или формат embedded-JSON — парсер сломается и нужно
 * будет руками править этот файл. Это единственный известный публично
 * доступный способ получить схему без OAuth-кредов.
 *
 * ## Usage
 *
 * ```
 * npx ts-node scripts/fetch-avito-schema.ts            # обновить snapshot
 * npx ts-node scripts/fetch-avito-schema.ts --check    # CI drift check
 * ```
 */

import {
  type AvitoFieldSnapshot,
  type AvitoTemplateSnapshot,
  isAvitoTemplateSnapshot,
} from "../src/formatter/avito/snapshotShape";

import fs from "fs";
import path from "path";

// Скрипт запускается через pnpm, поэтому cwd = root проекта.
const SNAPSHOTS_DIR = path.join(
  process.cwd(),
  "src",
  "formatter",
  "avito",
  "snapshots",
);

/**
 * Avito autoload template IDs, на которые опирается библиотека.
 * 100368 — мужские кеды/кроссовки/слипоны.
 * 100388 — женские кроссовки и кеды.
 * Per-template схема — `src/formatter/avito/templates/<id>.ts`.
 */
const TEMPLATE_IDS = [100368, 100388] as const;

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/**
 * Allowlist хостов, к которым скрипту разрешено ходить. `values_link`
 * приходит из embedded JSON Avito-доки и может быть как server-relative
 * (`/web/1/...`), так и абсолютным (`https://avito.ru/...`). WHATWG URL
 * парсит `@` как разделитель userinfo: `new URL("https://www.avito.ru@127
 * .0.0.1/").hostname === "127.0.0.1"` — без allowlist это SSRF-вектор
 * (CWE-918). См. OWASP SSRF Prevention Cheat Sheet.
 */
const ALLOWED_HOSTS = new Set(["avito.ru", "www.avito.ru"]);

const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;

const FETCH_TIMEOUT_MS = 15_000;

async function fetchHtml(url: string): Promise<string> {
  // redirect:"error" — без него 302 на 127.0.0.1 / cloud-metadata обошёл бы
  // host-allowlist на call-site. AbortSignal.timeout ограничивает slow-loris.
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
    redirect: "error",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  const text = await response.text();
  if (text.length > MAX_RESPONSE_BYTES) {
    throw new Error(
      `Response too large (${text.length} bytes > ${MAX_RESPONSE_BYTES}) for ${url}`,
    );
  }
  return text;
}

// Named entities, важные для embedded JSON Avito. Главный — `&nbsp;` (NBSP,
// U+00A0): в schema.adTypeValues этот символ обязателен, его подмена обычным
// пробелом ломает enum-валидацию на стороне Avito (см. SNEAKERS_AD_TYPE_VALUES).
const NAMED_ENTITIES: Record<string, string> = {
  "&quot;": '"',
  "&apos;": "'",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&nbsp;": " ",
  "&#39;": "'",
  "&#96;": "`",
};

function decodeEntities(s: string): string {
  let out = s;
  for (const [entity, char] of Object.entries(NAMED_ENTITIES)) {
    // &amp; декодируем последним, иначе превратили бы `&amp;quot;` в
    // `&quot;` и распакованной кавычкой сломали JSON-парсер ниже.
    if (entity === "&amp;") continue;
    out = out.replaceAll(entity, char);
  }
  // Numeric entities (`&#160;` / `&#xA0;`) — Avito может переключиться на них
  // в любой момент (видели и `&nbsp;`, и `&#160;` в разных частях embedded
  // JSON). Заодно покрывает любые U+XXXX, на которые named-таблица не успела.
  out = out.replaceAll(/&#(\d+);/g, (_, dec: string) =>
    String.fromCodePoint(Number(dec)),
  );
  out = out.replaceAll(/&#x([0-9a-fA-F]+);/g, (_, hex: string) =>
    String.fromCodePoint(Number.parseInt(hex, 16)),
  );
  return out.replaceAll("&amp;", "&");
}

function findEnclosingJsonObject(
  src: string,
  innerIdx: number,
): { start: number; end: number } {
  const openStack: number[] = [];
  let i = 0;
  let inString = false;
  while (i < src.length) {
    const ch = src[i];
    if (inString) {
      if (ch === "\\") {
        i += 2;
        continue;
      }
      if (ch === '"') inString = false;
      i++;
      continue;
    }
    if (ch === '"') {
      inString = true;
      i++;
      continue;
    }
    if (ch === "{") {
      openStack.push(i);
      i++;
      continue;
    }
    if (ch === "}") {
      const start = openStack.pop();
      if (start === undefined) throw new Error("Unbalanced }");
      if (start <= innerIdx && i >= innerIdx) {
        return { start, end: i + 1 };
      }
      i++;
      continue;
    }
    i++;
  }
  throw new Error("JSON-объект, охватывающий маркер node_name, не найден");
}

function isExtractedJson(value: unknown): value is {
  field_groups: Array<{ name: string; fields: AvitoFieldSnapshot[] }>;
  node_name?: string;
} {
  if (typeof value !== "object" || value === null) return false;
  if (!("field_groups" in value)) return false;
  return Array.isArray(value.field_groups);
}

function extractEmbeddedJson(html: string): {
  groups: Array<{ name: string; fields: AvitoFieldSnapshot[] }>;
  nodeName: string;
} {
  const decoded = decodeEntities(html);
  const marker = `"node_name":"`;
  const innerIdx = decoded.indexOf(marker);
  if (innerIdx < 0) {
    throw new Error(
      "Маркер node_name не найден — возможно, Avito переделал вёрстку доки. " +
        "Открой страницу руками, найди embedded JSON и обнови парсер.",
    );
  }
  const { start, end } = findEnclosingJsonObject(decoded, innerIdx);
  const raw = decoded.slice(start, end);
  const parsed: unknown = JSON.parse(raw);
  if (!isExtractedJson(parsed)) {
    throw new Error("В извлечённом JSON нет поля field_groups[]");
  }
  const nodeName =
    "node_name" in parsed && typeof parsed.node_name === "string"
      ? parsed.node_name
      : "";
  return { groups: parsed.field_groups, nodeName };
}

async function fetchExternalValues(link: string): Promise<string[]> {
  const resolved = new URL(
    link.replace(/&amp;/g, "&"),
    "https://www.avito.ru/",
  );
  if (resolved.protocol !== "https:") {
    throw new Error(`unsafe protocol for values_link: ${resolved.protocol}`);
  }
  if (!ALLOWED_HOSTS.has(resolved.hostname)) {
    throw new Error(`untrusted values_link host: ${resolved.hostname}`);
  }
  const xml = await fetchHtml(resolved.toString());
  const values = Array.from(xml.matchAll(/<value>([^<]+)<\/value>/g)).map(
    (m) => m[1],
  );
  if (values.length === 0) {
    // Avito CDN иногда отдаёт 200 с HTML error-page'ом вместо XML — fetch не
    // упадёт, regex молча даст []. В normal-run это сохранится как пустой
    // массив и потом всплывёт как drift в --check. Падаем явно — пусть
    // мейнтейнер увидит причину, а не «templates/<id>.ts разошлась со
    // snapshot'ом».
    throw new Error(`no <value> elements in ${resolved.toString()}`);
  }
  return values;
}

async function buildSnapshot(
  id: number,
  strict: boolean,
): Promise<AvitoTemplateSnapshot> {
  const url = `https://www.avito.ru/autoload/documentation/templates/${id}?fileFormat=xml`;
  const html = await fetchHtml(url);
  const { groups, nodeName } = extractEmbeddedJson(html);

  const pairs: Array<{ tag: string; link: string }> = [];
  for (const group of groups) {
    for (const field of group.fields) {
      if (field.values_link) {
        pairs.push({ tag: field.tag, link: field.values_link });
      }
    }
  }

  const externalValues: Record<string, string[]> = {};
  await Promise.all(
    pairs.map(async ({ tag, link }) => {
      try {
        externalValues[tag] = await fetchExternalValues(link);
      } catch (error) {
        const msg = `${id}/${tag}: не удалось скачать external values: ${String(error)}`;
        if (strict) {
          // В --check режиме нельзя молча оставлять snapshot без external
          // values: diff serialize'ов даст false-positive drift, разработчик
          // пойдёт чинить templates/<id>.ts вместо ремонта сети.
          throw new Error(msg);
        }
        console.warn(`[warn] ${msg}`);
      }
    }),
  );

  return {
    id,
    fetchedAt: new Date().toISOString(),
    nodeName,
    groups,
    externalValues,
  };
}

function serializeForFile(snapshot: AvitoTemplateSnapshot): string {
  return JSON.stringify(snapshot, null, 2) + "\n";
}

function serializeForDiff(snapshot: AvitoTemplateSnapshot): string {
  // fetchedAt меняется при каждом fetch'е, маскируем — иначе любой запуск
  // --check выдаст drift только на timestamp.
  return (
    JSON.stringify({ ...snapshot, fetchedAt: "<ignored-for-diff>" }, null, 2) +
    "\n"
  );
}

function loadExistingSnapshot(file: string): AvitoTemplateSnapshot {
  const raw = fs.readFileSync(file, "utf8");
  const parsed: unknown = JSON.parse(raw);
  if (!isAvitoTemplateSnapshot(parsed)) {
    throw new Error(
      `Snapshot ${file} повреждён или устарел — перезапустите pnpm schema:fetch`,
    );
  }
  return parsed;
}

async function run(): Promise<void> {
  const check = process.argv.includes("--check");
  if (!fs.existsSync(SNAPSHOTS_DIR)) {
    fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  }

  let driftCount = 0;
  for (const id of TEMPLATE_IDS) {
    console.log(`Получаю схему ${id}…`);
    const fresh = await buildSnapshot(id, check);
    const file = path.join(SNAPSHOTS_DIR, `avito-schema-${id}.json`);

    if (check) {
      if (!fs.existsSync(file)) {
        console.error(`  [DRIFT] Snapshot ${file} не существует.`);
        driftCount++;
        continue;
      }
      const existing = loadExistingSnapshot(file);
      if (serializeForDiff(existing) !== serializeForDiff(fresh)) {
        console.error(
          `  [DRIFT] ${file} отличается от live Avito documentation.`,
        );
        driftCount++;
      } else {
        console.log(`  [OK]`);
      }
    } else {
      fs.writeFileSync(file, serializeForFile(fresh), "utf8");
      const inlineEnums = fresh.groups.reduce(
        (acc, g) =>
          acc +
          g.fields.filter((f) => Array.isArray(f.values) && f.values.length > 0)
            .length,
        0,
      );
      const externalEnums = Object.keys(fresh.externalValues).length;
      const totalFields = fresh.groups.reduce(
        (acc, g) => acc + g.fields.length,
        0,
      );
      console.log(
        `  → ${file}: ${fresh.groups.length} групп, ${totalFields} полей, ` +
          `${inlineEnums} inline-enum'ов, ${externalEnums} external-enum'ов`,
      );
    }
  }

  if (check && driftCount > 0) {
    console.error(
      `\n${driftCount} категорий с drift'ом. Запусти fetch без --check для обновления, ` +
        `затем приведи соответствующий templates/<id>.ts в соответствие со snapshot'ом ` +
        `(см. test/avitoSchemaSync.spec.ts).`,
    );
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
