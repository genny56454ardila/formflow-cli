// annotate.js — CLI command handler for field annotation
const fs = require('fs');
const path = require('path');
const { loadSchema } = require('../schema/loader');
const { annotateSchema, removeSchemaAnnotation, listAnnotations } = require('../schema/annotator');

function resolveInputPath(inputArg) {
  return path.resolve(process.cwd(), inputArg);
}

async function runAnnotate(args, options = {}) {
  const { log = console.log, error = console.error } = options;

  const inputPath = resolveInputPath(args.input);
  let schema;
  try {
    schema = loadSchema(inputPath);
  } catch (e) {
    error(`Failed to load schema: ${e.message}`);
    return 1;
  }

  const { field, key, value, remove, list } = args;

  if (list) {
    const target = schema.fields.find(f => f.name === field);
    if (!target) { error(`Field '${field}' not found`); return 1; }
    const annotations = listAnnotations(target);
    const entries = Object.entries(annotations);
    if (entries.length === 0) { log(`No annotations on '${field}'`); }
    else entries.forEach(([k, v]) => log(`  ${k}: ${v}`));
    return 0;
  }

  if (!key) { error('--key is required'); return 1; }

  let updated;
  if (remove) {
    updated = removeSchemaAnnotation(schema, field, key);
    log(`Removed annotation '${key}' from '${field}'`);
  } else {
    if (value === undefined) { error('--value is required when adding an annotation'); return 1; }
    updated = annotateSchema(schema, field, key, value);
    log(`Annotated '${field}' with ${key}=${value}`);
  }

  const outputPath = args.output ? resolveInputPath(args.output) : inputPath;
  fs.writeFileSync(outputPath, JSON.stringify(updated, null, 2));
  return 0;
}

module.exports = { resolveInputPath, runAnnotate };
