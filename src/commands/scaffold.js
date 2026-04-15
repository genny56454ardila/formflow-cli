const path = require('path');
const fs = require('fs/promises');
const { generateSchema, serializeSchema } = require('../schema/generator');

/**
 * Build a minimal schema config from CLI prompts/options
 * @param {string} formId
 * @param {string[]} fieldDefs  e.g. ["name:text", "email:email"]
 * @returns {object}
 */
function buildSchemaConfig(formId, fieldDefs = []) {
  const fields = fieldDefs.map((def) => {
    const [name, type = 'text'] = def.split(':');
    return { name: name.trim(), type: type.trim(), required: false };
  });
  return { id: formId, fields };
}

/**
 * Run the scaffold command — generates a schema JSON file
 * @param {string} formId - identifier for the form
 * @param {string} outputArg - destination file path
 * @param {object} options - { fields: string[], overwrite: boolean, quiet: boolean }
 * @returns {Promise<string>} resolved output path
 */
async function runScaffold(formId, outputArg, options = {}) {
  if (!formId) {
    throw new Error('Form ID is required. Usage: formflow scaffold <id> <output.json>');
  }

  const outputPath = outputArg
    ? path.isAbsolute(outputArg) ? outputArg : path.resolve(process.cwd(), outputArg)
    : path.resolve(process.cwd(), `${formId}.schema.json`);

  if (!options.overwrite) {
    try {
      await fs.access(outputPath);
      throw new Error(`File already exists: ${outputPath}. Use --overwrite to replace it.`);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }

  const config = buildSchemaConfig(formId, options.fields || []);
  const schema = generateSchema(config);
  const serialized = serializeSchema(schema);

  await fs.writeFile(outputPath, serialized, 'utf8');

  if (!options.quiet) {
    console.log(`✔  Scaffolded schema written to: ${outputPath}`);
  }

  return outputPath;
}

module.exports = { buildSchemaConfig, runScaffold };
