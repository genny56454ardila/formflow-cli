/**
 * sorter.js — Sort schema fields by various criteria
 */

const VALID_SORT_KEYS = ['name', 'type', 'required', 'label'];
const VALID_ORDERS = ['asc', 'desc'];

/**
 * Sort an array of fields by a given key and order.
 * @param {Array} fields
 * @param {string} key
 * @param {string} order
 * @returns {Array}
 */
function sortFields(fields, key = 'name', order = 'asc') {
  if (!VALID_SORT_KEYS.includes(key)) {
    throw new Error(`Invalid sort key: "${key}". Valid keys: ${VALID_SORT_KEYS.join(', ')}`);
  }
  if (!VALID_ORDERS.includes(order)) {
    throw new Error(`Invalid sort order: "${order}". Use "asc" or "desc".`);
  }

  const sorted = [...fields].sort((a, b) => {
    const aVal = a[key] ?? '';
    const bVal = b[key] ?? '';

    if (typeof aVal === 'boolean' || typeof bVal === 'boolean') {
      const aN = aVal === true ? 1 : 0;
      const bN = bVal === true ? 1 : 0;
      return order === 'asc' ? aN - bN : bN - aN;
    }

    const cmp = String(aVal).localeCompare(String(bVal));
    return order === 'asc' ? cmp : -cmp;
  });

  return sorted;
}

/**
 * Sort all fields in a schema.
 * @param {Object} schema
 * @param {string} key
 * @param {string} order
 * @returns {Object}
 */
function sortSchema(schema, key = 'name', order = 'asc') {
  if (!schema || typeof schema !== 'object') {
    throw new Error('Invalid schema: expected an object.');
  }
  if (!Array.isArray(schema.fields)) {
    throw new Error('Schema must have a "fields" array.');
  }

  return {
    ...schema,
    fields: sortFields(schema.fields, key, order),
  };
}

module.exports = { sortFields, sortSchema, VALID_SORT_KEYS, VALID_ORDERS };
