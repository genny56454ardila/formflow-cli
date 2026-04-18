const path = require('path');
const fs = require('fs');
const { loadSchema } = require('../schema/loader');
const { cloneFieldInSchema, cloneSchema } = require('../schema/cloner');

function resolveInputPath(input) {
  return path.isAbsolute(input) ? input : path.resolve(process.cwd(), input);
}

async function runClone(args) {
  const { input, output, field, name, schemaTitle } = args;

  if (!input) {
    console.error('Error: --input is required');
    process.exit(1);
  }

  const inputPath = resolveInputPath(input);
  let schema;
  try {
    schema = await loadSchema(inputPath);
  } catch (err) {
    console.error(`Error loading schema: ${err.message}`);
    process.exit(1);
  }

  let result;
  try {
    if (field) {
      result = cloneFieldInSchema(schema, field, name || undefined);
      console.log(`Cloned field "${field}" as "${result.fields[result.fields.length - 1].name}"`);
    } else {
      result = cloneSchema(schema, schemaTitle || undefined);
      console.log(`Cloned schema as "${result.title}"`);
    }
  } catch (err) {
    console.error(`Error cloning: ${err.message}`);
    process.exit(1);
  }

  const outputPath = output
    ? resolveInputPath(output)
    : inputPath.replace(/\.json$/, '.clone.json');

  try {
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`Saved to ${outputPath}`);
  } catch (err) {
    console.error(`Error writing output: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { resolveInputPath, runClone };
