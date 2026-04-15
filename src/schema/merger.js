/**
 * merger.js
 * Merges two or more form schemas into a single unified schema.
 */

/**
 * Merges fields from multiple schemas, deduplicating by field name.
 * Later schemas take precedence for duplicate field names.
 * @param {...object[]} fieldArrays
 * @returns {object[]}
 */
function mergeFields(...fieldArrays) {
  const fieldMap = new Map();

  for (const fields of fieldArrays) {
    if (!Array.isArray(fields)) {
      throw new Error('Each schema must have a valid fields array');
    }
    for (const field of fields) {
      if (!field.name) {
        throw new Error('Each field must have a name property');
      }
      fieldMap.set(field.name, { ...fieldMap.get(field.name), ...field });
    }
  }

  return Array.from(fieldMap.values());
}

/**
 * Merges two or more schema objects into one.
 * @param {...object} schemas
 * @returns {object}
 */
function mergeSchemas(...schemas) {
  if (schemas.length < 2) {
    throw new Error('At least two schemas are required to merge');
  }

  for (const schema of schemas) {
    if (!schema || typeof schema !== 'object') {
      throw new Error('All arguments must be valid schema objects');
    }
    if (!schema.name || !Array.isArray(schema.fields)) {
      throw new Error('Each schema must have a name and fields array');
    }
  }

  const base = schemas[0];
  const rest = schemas.slice(1);

  const mergedMeta = rest.reduce(
    (acc, s) => ({
      ...acc,
      description: s.description || acc.description,
      version: s.version || acc.version,
    }),
    { description: base.description, version: base.version }
  );

  return {
    name: base.name,
    ...mergedMeta,
    fields: mergeFields(...schemas.map((s) => s.fields)),
  };
}

module.exports = { mergeFields, mergeSchemas };
