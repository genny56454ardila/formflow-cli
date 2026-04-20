// linker.js — link fields together via dependencies or references

/**
 * Link a field to one or more other fields by name
 * @param {Object} field
 * @param {string[]} linkedTo - field names this field depends on
 * @returns {Object}
 */
function linkField(field, linkedTo = []) {
  return {
    ...field,
    linkedTo: [...new Set([...(field.linkedTo || []), ...linkedTo])],
  };
}

/**
 * Remove a link from a field
 * @param {Object} field
 * @param {string} targetName - field name to unlink
 * @returns {Object}
 */
function unlinkField(field, targetName) {
  return {
    ...field,
    linkedTo: (field.linkedTo || []).filter((n) => n !== targetName),
  };
}

/**
 * Apply field linking across a schema
 * @param {Object} schema
 * @param {string} fieldName
 * @param {string[]} linkedTo
 * @returns {Object}
 */
function linkFieldInSchema(schema, fieldName, linkedTo = []) {
  const fields = schema.fields.map((f) =>
    f.name === fieldName ? linkField(f, linkedTo) : f
  );
  return { ...schema, fields };
}

/**
 * Remove a link from a field in a schema
 * @param {Object} schema
 * @param {string} fieldName
 * @param {string} targetName
 * @returns {Object}
 */
function unlinkFieldInSchema(schema, fieldName, targetName) {
  const fields = schema.fields.map((f) =>
    f.name === fieldName ? unlinkField(f, targetName) : f
  );
  return { ...schema, fields };
}

/**
 * List all field links in a schema
 * @param {Object} schema
 * @returns {Object[]} - array of { field, linkedTo }
 */
function listLinks(schema) {
  return schema.fields
    .filter((f) => f.linkedTo && f.linkedTo.length > 0)
    .map((f) => ({ field: f.name, linkedTo: f.linkedTo }));
}

module.exports = {
  linkField,
  unlinkField,
  linkFieldInSchema,
  unlinkFieldInSchema,
  listLinks,
};
