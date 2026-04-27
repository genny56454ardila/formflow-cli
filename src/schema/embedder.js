/**
 * embedder.js — Embed external schema references inline into a parent schema
 */

/**
 * Embed a single field's $ref with the provided resolved schema fragment.
 * @param {object} field
 * @param {object} refSchema - the schema to embed
 * @returns {object} field with embedded properties
 */
function embedField(field, refSchema) {
  if (!field || typeof field !== 'object') throw new Error('Invalid field');
  if (!refSchema || typeof refSchema !== 'object') throw new Error('Invalid refSchema');
  const { $ref, ...rest } = field;
  return { ...rest, embedded: true, embeddedFrom: $ref || null, ...refSchema };
}

/**
 * Resolve all fields in a schema that have a $ref property using a resolver map.
 * @param {object} schema
 * @param {object} refMap - map of ref string to schema fragment
 * @returns {object} new schema with embedded fields
 */
function embedSchema(schema, refMap) {
  if (!schema || !Array.isArray(schema.fields)) throw new Error('Invalid schema');
  if (!refMap || typeof refMap !== 'object') throw new Error('Invalid refMap');

  const fields = schema.fields.map((field) => {
    if (field.$ref) {
      const resolved = refMap[field.$ref];
      if (!resolved) throw new Error(`Unresolved $ref: ${field.$ref}`);
      return embedField(field, resolved);
    }
    return field;
  });

  return { ...schema, fields };
}

/**
 * List all fields in a schema that contain an embedded reference.
 * @param {object} schema
 * @returns {object[]}
 */
function listEmbedded(schema) {
  if (!schema || !Array.isArray(schema.fields)) throw new Error('Invalid schema');
  return schema.fields.filter((f) => f.embedded === true);
}

/**
 * Strip embedded metadata from all fields, restoring $ref where available.
 * @param {object} schema
 * @returns {object}
 */
function stripEmbeds(schema) {
  if (!schema || !Array.isArray(schema.fields)) throw new Error('Invalid schema');
  const fields = schema.fields.map((field) => {
    if (!field.embedded) return field;
    const { embedded, embeddedFrom, type, label, ...rest } = field;
    const base = { ...rest };
    if (embeddedFrom) base.$ref = embeddedFrom;
    return base;
  });
  return { ...schema, fields };
}

module.exports = { embedField, embedSchema, listEmbedded, stripEmbeds };
