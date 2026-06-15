#!/usr/bin/env node
/**
 * Validador de referências a regras de negócio (BR-*, TMP-*, INT-*).
 *
 * Fonte de verdade: docs/business/*.md (catálogo).
 * Lê paths de código em project.config.json (codeScanPaths).
 *
 * Uso:
 *   node scripts/validate-br-refs.mjs
 *   node scripts/validate-br-refs.mjs --strict
 *
 * --strict: falha se o catálogo contiver apenas arquivos _exemplo-* / _transversal.md
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const STRICT = process.argv.includes("--strict");
const BRIEFING_STATUS = ["rascunho", "aprovado", "implementado", "arquivado"];

const DEFAULT_CONFIG = {
  codeScanPaths: ["backend", "frontend/src"],
  codeScanExtensions: {
    backend: [".go"],
    "frontend/src": [".ts", ".tsx"],
  },
};

function loadConfig() {
  const configPath = path.join(ROOT, "project.config.json");
  if (!fs.existsSync(configPath)) return DEFAULT_CONFIG;
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(configPath, "utf8")) };
  } catch {
    console.warn("Aviso: project.config.json inválido — usando defaults");
    return DEFAULT_CONFIG;
  }
}

function buildIdPattern(config) {
  const families = config.idFamilies ?? {};
  const parts = [];
  if (families.business) parts.push(families.business.replace(/^\^|\$$/g, ""));
  else parts.push("BR-[A-Z]+-\\d{3}");
  if (families.temporal) parts.push(families.temporal.replace(/^\^|\$$/g, ""));
  else parts.push("TMP-\\d{3}");
  if (families.integrity) parts.push(families.integrity.replace(/^\^|\$$/g, ""));
  else parts.push("INT-\\d{3}");
  return new RegExp(`\\b(?:${parts.join("|")})\\b`, "g");
}

function listFiles(dir, exts) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (exts.some((e) => entry.name.endsWith(e))) out.push(full);
    }
  };
  walk(abs);
  return out;
}

function getExtensionsForPath(config, scanPath) {
  const map = config.codeScanExtensions ?? DEFAULT_CONFIG.codeScanExtensions;
  if (map[scanPath]) return map[scanPath];
  if (scanPath.includes("frontend")) return [".ts", ".tsx", ".js", ".jsx"];
  if (scanPath.includes("backend") || scanPath.includes("src")) return [".go", ".py", ".rs", ".java"];
  return [".ts", ".tsx", ".go", ".py"];
}

const config = loadConfig();
const ID_PATTERN = buildIdPattern(config);
const errors = [];

// 1. Coletar IDs definidos no catálogo
const businessFiles = listFiles("docs/business", [".md"]);
const definedIds = new Set();
const catalogBasenames = businessFiles.map((f) => path.basename(f));

for (const file of businessFiles) {
  const matches = fs.readFileSync(file, "utf8").match(ID_PATTERN) ?? [];
  for (const id of matches) definedIds.add(id);
}

if (definedIds.size === 0) {
  console.error("ERRO: nenhum ID encontrado em docs/business/ — catálogo ausente?");
  process.exit(1);
}

if (STRICT) {
  const onlyExamples = catalogBasenames.every(
    (b) => b === "README.md" || b.startsWith("_")
  );
  if (onlyExamples) {
    errors.push(
      "modo --strict: catálogo contém apenas arquivos de exemplo (_*.md) — crie módulos reais"
    );
  }
}

// 2. Verificar referências em código (paths configuráveis) e briefings
const scanTargets = [...listFiles("docs/briefings", [".md"])];

for (const scanPath of config.codeScanPaths ?? []) {
  const exts = getExtensionsForPath(config, scanPath);
  scanTargets.push(...listFiles(scanPath, exts));
}

for (const file of scanTargets) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    const localPattern = new RegExp(ID_PATTERN.source, "g");
    for (const id of line.match(localPattern) ?? []) {
      if (!definedIds.has(id)) {
        errors.push(
          `${path.relative(ROOT, file)}:${i + 1} — ID "${id}" não existe em docs/business/`
        );
      }
    }
  });
}

// 3. Verificar metadados dos briefings
const briefings = listFiles("docs/briefings", [".md"]).filter((f) => {
  const base = path.basename(f);
  return base !== "README.md" && base !== "briefing-template.md";
});

for (const file of briefings) {
  const rel = path.relative(ROOT, file);
  const content = fs.readFileSync(file, "utf8");

  if (!/\bBRF-\d{3}\b/.test(content)) {
    errors.push(`${rel} — briefing sem ID "BRF-NNN" nos metadados`);
  }

  const statusMatch = content.match(/\|\s*Status\s*\|\s*([^|\n]+)\|/i);
  const status = statusMatch?.[1].trim().toLowerCase();
  if (!status || !BRIEFING_STATUS.includes(status)) {
    errors.push(
      `${rel} — Status ausente ou inválido (esperado: ${BRIEFING_STATUS.join(" | ")})`
    );
  }

  if (!/\bBR-[A-Z]+-\d{3}\b/.test(content)) {
    errors.push(`${rel} — briefing não referencia nenhuma regra BR-* do catálogo`);
  }
}

if (errors.length > 0) {
  console.error(`validate-br-refs: ${errors.length} violação(ões):\n`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

console.log(
  `validate-br-refs: OK — ${definedIds.size} IDs no catálogo, ` +
    `${scanTargets.length} arquivos verificados, ${briefings.length} briefing(s).`
);
