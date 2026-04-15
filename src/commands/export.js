const path = require('path');
const { loadSchema } = require('../schema/loader');
const { validateSchema } = require('../schema/validator');
const { exportSchema, EXPORT_FORMATS } = require('../schema/exporter');
const { formatErrors } = require('../schema/formatter');

/**
 * Resolve output path based on input path and desired format
 * @param {string} inputPath
 * @param {string} format
 * @returns {string}
 */
function resolveOutputPath(inputPath, format) {
  const ext = format === 'markdown' ? 'md' : format;
  const base = path.basename(inputPath, path.extname(inputPath));
  const dir = path.dirname(inputPath);
  return path.join(dir, `${base}.${ext}`);
}

/**
 * Run the export command
 * @param {string} inputPath - path to JSON schema file
 * @param {object} options
 * @param {string} [options.format] - export format (json|html|markdown)
 * @param {string} [options.output] - custom output path
 * @param {boolean} [options.skipValidation] - skip schema validation
 * @returns {{ success: boolean, message: string }}
 */
function runExport(inputPath, options = {}) {
  const format = options.format || 'json';

  if (!EXPORT_FORMATS.includes(format)) {
    return { success: false, message: `Unknown format "${format}". Supported: ${EXPORT_FORMATS.join(', ')}` };
  }

  let schema;
  try {
    schema = loadSchema(inputPath);
  } catch (err) {
    return { success: false, message: `Failed to load schema: ${err.message}` };
  }

  if (!options.skipValidation) {
    const errors = validateSchema(schema);
    if (errors.length > 0) {
      return {
        success: false,
        message: `Schema validation failed:\n${formatErrors(errors)}`,
      };
    }
  }

  const outputPath = options.output || resolveOutputPath(inputPath, format);
  return exportSchema(schema, outputPath, format);
}

module.exports = { runExport, resolveOutputPath };
