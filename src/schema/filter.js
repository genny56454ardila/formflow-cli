/**
 * Filter fields in a schema by type, required status, or custom predicate.
 */

/**
 * Filter fields in an array by given criteria.
 * @param {Array} fields
 * @param {Object} options
 * @param {string} [options.type] - Only include fields of this type
 * @param {boolean} [options.required] - Only include fields matching required status
 * @param {Function} [options.predicate] - Custom filter function
 * @returns {Array}
 */
function filterFields(fields, options = {}) {
  if (!Array.isArray(fields)) {
    throw new Error('fields must be an array');
  }

  let result = [...fields];

  if (options.type !== undefined) {
    result = result.filter((f) => f.type === options.type);
  }

  if (options.required !== undefined) {
    result = result.filter((f) => Boolean(f.required) === options.required);
  }

  if (typeof options.predicate === 'function') {
    result = result.filter(options.predicate);
  }

  return result;
}

/**
 * Filter fields in a schema object.
 * @param {Object} schema
 * @param {Object} options
 * @returns {Object}
 */
function filterSchema(schema, options = {}) {
  if (!schema || typeof schema !== 'object') {
    throw new Error('schema must be an object');
  }

  if (!Array.isArray(schema.fields)) {
    throw new Error('schema.fields must be an array');
  }

  return {
    ...schema,
    fields: filterFields(schema.fields, options),
  };
}

module.exports = { filterFields, filterSchema };
