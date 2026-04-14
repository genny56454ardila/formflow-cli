const fs = require('fs');
const path = require('path');

/**
 * Loads and parses a JSON form schema from the given file path.
 * Throws descriptive errors for missing files or invalid JSON.
 */
function loadSchema(filePath) {
  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`Schema file not found: ${resolved}`);
  }

  const ext = path.extname(resolved).toLowerCase();
  if (ext !== '.json') {
    throw new Error(`Schema file must be a .json file, got: ${ext}`);
  }

  let raw;
  try {
    raw = fs.readFileSync(resolved, 'utf-8');
  } catch (err) {
    throw new Error(`Failed to read schema file: ${err.message}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in schema file: ${err.message}`);
  }

  return parsed;
}

module.exports = { loadSchema };
