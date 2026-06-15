#!/usr/bin/env node
/**
 * Valida estrutura mínima do projeto Cocal Campo (documentação viva).
 * Uso: node scripts/validate-project.mjs
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

const REQUIRED = [
  "README.md",
  "AGENTS.md",
  "project.config.json",
  "package.json",
  ".cursorignore",
  ".cursor/hooks.json",
  ".cursor/hooks/validate-docs-after-edit.sh",
  ".cursor/hooks/block-no-verify.sh",
  ".devcontainer/devcontainer.json",
  ".devcontainer/Dockerfile",
  "memory-bank/activeContext.md",
  "memory-bank/projectbrief.md",
  "memory-bank/productContext.md",
  "memory-bank/progress.md",
  "memory-bank/systemPatterns.md",
  "memory-bank/techContext.md",
  "memory-bank/deploy-notes.md",
  "docs/business/README.md",
  "docs/briefings/README.md",
  "docs/briefings/briefing-template.md",
  "docs/architecture/README.md",
  "docs/ops/documentation-checklist.md",
  "scripts/validate-br-refs.mjs",
  "scripts/validate-project.mjs",
  ".cursor/rules/documentation-maintenance.mdc",
  ".cursor/rules/project-context.mdc",
  ".cursor/rules/domain-patterns.mdc",
  ".cursor/rules/typescript-standards.mdc",
  ".cursor/rules/go-standards.mdc",
  ".github/workflows/docs-validate.yml",
];

const RULE_FILES = REQUIRED.filter((rel) => rel.startsWith(".cursor/rules/") && rel.endsWith(".mdc"));

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const fm = {};
  for (const line of match[1].split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const sep = trimmed.indexOf(":");
    if (sep === -1) continue;
    const key = trimmed.slice(0, sep).trim();
    let value = trimmed.slice(sep + 1).trim();
    if (value === "true") value = true;
    else if (value === "false") value = false;
    fm[key] = value;
  }
  return fm;
}

function validateRuleFrontmatter(rel) {
  const errors = [];
  const abs = path.join(ROOT, rel);
  const content = fs.readFileSync(abs, "utf8");

  if (!rel.endsWith(".mdc")) {
    errors.push(`${rel}: extensão deve ser .mdc`);
    return errors;
  }

  const fm = parseFrontmatter(content);
  if (!fm) {
    errors.push(`${rel}: frontmatter YAML ausente ou inválido`);
    return errors;
  }

  if (typeof fm.alwaysApply !== "boolean") {
    errors.push(`${rel}: campo obrigatório 'alwaysApply' (true|false) ausente ou inválido`);
  }

  if (fm.alwaysApply === false && !fm.description && !fm.globs) {
    errors.push(
      `${rel}: alwaysApply false exige 'description' (Apply Intelligently) ou 'globs' (Apply to Specific Files)`
    );
  }

  if (fm.alwaysApply === true && !fm.description) {
    errors.push(`${rel}: recomendado incluir 'description' para exibição no Cursor Settings`);
  }

  const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").trim();
  if (!body) {
    errors.push(`${rel}: conteúdo da rule vazio após frontmatter`);
  }

  if (content.split("\n").length > 500) {
    errors.push(`${rel}: rule excede 500 linhas (limite Cursor)`);
  }

  return errors;
}

const missing = REQUIRED.filter((rel) => !fs.existsSync(path.join(ROOT, rel)));
const ruleErrors = RULE_FILES.flatMap((rel) => validateRuleFrontmatter(rel));

if (missing.length > 0 || ruleErrors.length > 0) {
  if (missing.length > 0) {
    console.error("validate-project: arquivos obrigatórios ausentes:\n");
    for (const m of missing) console.error(`  - ${m}`);
  }
  if (ruleErrors.length > 0) {
    console.error("\nvalidate-project: erros nas Cursor rules (.mdc):\n");
    for (const e of ruleErrors) console.error(`  - ${e}`);
  }
  process.exit(1);
}

console.log(
  `validate-project: OK — ${REQUIRED.length} arquivos presentes, ${RULE_FILES.length} rules .mdc validadas.`
);
