// tagger.js — add, remove, and filter fields by tags

/**
 * Add a tag to a field (returns new field object)
 * @param {object} field
 * @param {string} tag
 * @returns {object}
 */
function tagField(field, tag) {
  const tags = new Set(field.tags || []);
  tags.add(tag);
  return { ...field, tags: Array.from(tags) };
}

/**
 * Remove a tag from a field
 * @param {object} field
 * @param {string} tag
 * @returns {object}
 */
function untagField(field, tag) {
  const tags = (field.tags || []).filter(t => t !== tag);
  return { ...field, tags };
}

/**
 * Get all fields that have a specific tag
 * @param {object[]} fields
 * @param {string} tag
 * @returns {object[]}
 */
function getFieldsByTag(fields, tag) {
  return fields.filter(f => Array.isArray(f.tags) && f.tags.includes(tag));
}

/**
 * Apply tag operation to a field in a schema by field name
 * @param {object} schema
 * @param {string} fieldName
 * @param {string} tag
 * @param {'add'|'remove'} action
 * @returns {object}
 */
function tagSchema(schema, fieldName, tag, action = 'add') {
  if (!schema || !Array.isArray(schema.fields)) {
    throw new Error('Invalid schema: missing fields array');
  }
  const fields = schema.fields.map(f => {
    if (f.name !== fieldName) return f;
    return action === 'remove' ? untagField(f, tag) : tagField(f, tag);
  });
  return { ...schema, fields };
}

/**
 * Collect all unique tags across all fields
 * @param {object} schema
 * @returns {string[]}
 */
function listAllTags(schema) {
  if (!schema || !Array.isArray(schema.fields)) return [];
  const tags = new Set();
  for (const field of schema.fields) {
    if (Array.isArray(field.tags)) field.tags.forEach(t => tags.add(t));
  }
  return Array.from(tags).sort();
}

module.exports = { tagField, untagField, getFieldsByTag, tagSchema, listAllTags };
