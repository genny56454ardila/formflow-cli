/**
 * Reorder fields in a schema by a given array of field names.
 */

/**
 * Reorder fields by a specified name order.
 * Fields not in the order array are appended at the end.
 * @param {Array} fields
 * @param {Array<string>} order - array of field names
 * @returns {Array}
 */
function reorderFields(fields, order) {
  if (!Array.isArray(fields)) throw new Error('fields must be an array');
  if (!Array.isArray(order)) throw new Error('order must be an array');

  const ordered = order
    .map(name => fields.find(f => f.name === name))
    .filter(Boolean);

  const remaining = fields.filter(f => !order.includes(f.name));

  return [...ordered, ...remaining];
}

/**
 * Reorder fields in a schema object.
 * @param {Object} schema
 * @param {Array<string>} order
 * @returns {Object}
 */
function reorderSchema(schema, order) {
  if (!schema || typeof schema !== 'object') throw new Error('Invalid schema');
  if (!Array.isArray(schema.fields)) throw new Error('Schema must have a fields array');

  return {
    ...schema,
    fields: reorderFields(schema.fields, order),
  };
}

module.exports = { reorderFields, reorderSchema };
