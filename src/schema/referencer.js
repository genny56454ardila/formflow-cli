// referencer.js — link fields to external reference definitions

/**
 * Add a reference to a field
 * @param {object} field
 * @param {string} refId - reference identifier
 * @param {string} [description] - optional description
 * @returns {object}
 */
function addReference(field, refId, description = '') {
  if (!refId || typeof refId !== 'string') throw new Error('refId must be a non-empty string');
  const refs = field.refs ? [...field.refs] : [];
  if (refs.find(r => r.id === refId)) return field;
  return { ...field, refs: [...refs, { id: refId, description }] };
}

/**
 * Remove a reference from a field
 * @param {object} field
 * @param {string} refId
 * @returns {object}
 */
function removeReference(field, refId) {
  if (!field.refs) return field;
  return { ...field, refs: field.refs.filter(r => r.id !== refId) };
}

/**
 * List all references for a field
 * @param {object} field
 * @returns {Array}
 */
function listReferences(field) {
  return field.refs || [];
}

/**
 * Apply reference operations to all fields in a schema
 * @param {object} schema
 * @param {string} fieldName
 * @param {string} refId
 * @param {string} [description]
 * @returns {object}
 */
function addReferenceInSchema(schema, fieldName, refId, description = '') {
  return {
    ...schema,
    fields: schema.fields.map(f =>
      f.name === fieldName ? addReference(f, refId, description) : f
    )
  };
}

/**
 * Remove a reference from a specific field in a schema
 * @param {object} schema
 * @param {string} fieldName
 * @param {string} refId
 * @returns {object}
 */
function removeReferenceInSchema(schema, fieldName, refId) {
  return {
    ...schema,
    fields: schema.fields.map(f =>
      f.name === fieldName ? removeReference(f, refId) : f
    )
  };
}

/**
 * Collect all unique reference IDs across the schema
 * @param {object} schema
 * @returns {string[]}
 */
function listAllReferences(schema) {
  const ids = new Set();
  for (const field of schema.fields) {
    for (const ref of listReferences(field)) {
      ids.add(ref.id);
    }
  }
  return [...ids];
}

module.exports = {
  addReference,
  removeReference,
  listReferences,
  addReferenceInSchema,
  removeReferenceInSchema,
  listAllReferences
};
