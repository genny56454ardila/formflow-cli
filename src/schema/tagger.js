// tagger.js — add, remove, and list tags on schema fields

function tagField(field, tags) {
  if (!field || typeof field !== 'object') throw new Error('Invalid field');
  const existing = field.tags || [];
  const merged = Array.from(new Set([...existing, ...tags]));
  return { ...field, tags: merged };
}

function untagField(field, tags) {
  if (!field || typeof field !== 'object') throw new Error('Invalid field');
  const existing = field.tags || [];
  return { ...field, tags: existing.filter(t => !tags.includes(t)) };
}

function tagSchema(schema, fieldName, tags) {
  if (!schema || !Array.isArray(schema.fields)) throw new Error('Invalid schema');
  const fields = schema.fields.map(f =>
    f.name === fieldName ? tagField(f, tags) : f
  );
  return { ...schema, fields };
}

function untagSchema(schema, fieldName, tags) {
  if (!schema || !Array.isArray(schema.fields)) throw new Error('Invalid schema');
  const fields = schema.fields.map(f =>
    f.name === fieldName ? untagField(f, tags) : f
  );
  return { ...schema, fields };
}

function listTags(schema) {
  if (!schema || !Array.isArray(schema.fields)) throw new Error('Invalid schema');
  const tagSet = new Set();
  for (const field of schema.fields) {
    for (const tag of (field.tags || [])) tagSet.add(tag);
  }
  return Array.from(tagSet).sort();
}

module.exports = { tagField, untagField, tagSchema, untagSchema, listTags };
