const { loadSchema } = require('./loader');

/**
 * Search fields in a schema by a query string against field name, label, or type.
 * @param {object} schema
 * @param {string} query
 * @param {object} options
 * @returns {Array}
 */
function searchFields(schema, query, options = {}) {
  if (!schema || !Array.isArray(schema.fields)) {
    throw new Error('Invalid schema: missing fields array');
  }
  if (typeof query !== 'string' || query.trim() === '') {
    throw new Error('Query must be a non-empty string');
  }

  const { caseSensitive = false, searchIn = ['name', 'label', 'type'] } = options;
  const needle = caseSensitive ? query : query.toLowerCase();

  return schema.fields.filter((field) => {
    return searchIn.some((key) => {
      const val = field[key];
      if (typeof val !== 'string') return false;
      const haystack = caseSensitive ? val : val.toLowerCase();
      return haystack.includes(needle);
    });
  });
}

/**
 * Search a schema file for fields matching a query.
 * @param {string} schemaPath
 * @param {string} query
 * @param {object} options
 * @returns {{ schema: object, results: Array }}
 */
async function searchSchema(schemaPath, query, options = {}) {
  const schema = await loadSchema(schemaPath);
  const results = searchFields(schema, query, options);
  return { schema, results };
}

module.exports = { searchFields, searchSchema };
