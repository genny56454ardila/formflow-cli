const path = require('path');
const fs = require('fs');
const { duplicateSchemaField } = require('../schema/duplicator');
const { serializeSchema } = require('../schema/generator');

/**
 * Resolve and validate the input path.
 * @param {string} inputPath
 * @returns {string}
 */
function resolveInputPath(inputPath) {
  if (!inputPath) throw new Error('Input path is required');
  const resolved = path.resolve(inputPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }
  return resolved;
}

/**
 * Run the duplicate command.
 * @param {string} inputPath   - path to the schema JSON file
 * @param {string} fieldName   - name of the field to duplicate
 * @param {string} newName     - name for the duplicated field
 * @param {object} options
 * @param {string} [options.output] - optional output file path
 * @param {boolean} [options.inPlace] - overwrite the input file
 */
async function runDuplicate(inputPath, fieldName, newName, options = {}) {
  const resolved = resolveInputPath(inputPath);

  if (!fieldName || typeof fieldName !== 'string') {
    throw new Error('Field name is required');
  }
  if (!newName || typeof newName !== 'string') {
    throw new Error('New field name is required');
  }

  const updatedSchema = await duplicateSchemaField(resolved, fieldName, newName);
  const serialized = serializeSchema(updatedSchema);

  let outputPath;
  if (options.output) {
    outputPath = path.resolve(options.output);
  } else if (options.inPlace) {
    outputPath = resolved;
  }

  if (outputPath) {
    fs.writeFileSync(outputPath, serialized, 'utf8');
    console.log(`Duplicated field "${fieldName}" as "${newName}" → ${outputPath}`);
  } else {
    console.log(serialized);
  }

  return updatedSchema;
}

module.exports = { resolveInputPath, runDuplicate };
