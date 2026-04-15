const path = require('path');
const { loadSchema } = require('../schema/loader');
const { validateSchema } = require('../schema/validator');
const { formatErrors, formatSchema } = require('../schema/formatter');

/**
 * Resolve the input path from CLI args or default
 * @param {string} inputArg
 * @returns {string}
 */
function resolveInputPath(inputArg) {
  if (!inputArg) {
    throw new Error('No input file specified. Usage: formflow validate <schema.json>');
  }
  return path.isAbsolute(inputArg) ? inputArg : path.resolve(process.cwd(), inputArg);
}

/**
 * Run the validate command
 * @param {string} inputArg - path to schema JSON file
 * @param {object} options - CLI options (e.g. { verbose, quiet })
 * @returns {Promise<{ valid: boolean, errors: string[] }>}
 */
async function runValidate(inputArg, options = {}) {
  const inputPath = resolveInputPath(inputArg);

  let schema;
  try {
    schema = await loadSchema(inputPath);
  } catch (err) {
    throw new Error(`Failed to load schema: ${err.message}`);
  }

  const { valid, errors } = validateSchema(schema);

  if (!options.quiet) {
    if (valid) {
      console.log(`✔  Schema is valid: ${path.basename(inputPath)}`);
      if (options.verbose) {
        console.log(formatSchema(schema));
      }
    } else {
      console.error(`✖  Schema validation failed: ${path.basename(inputPath)}`);
      console.error(formatErrors(errors));
    }
  }

  return { valid, errors };
}

module.exports = { resolveInputPath, runValidate };
