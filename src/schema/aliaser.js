// aliaser.js — add/remove/list aliases on schema fields

function aliasField(field, alias) {
  if (!alias || typeof alias !== 'string') throw new Error('Alias must be a non-empty string');
  const aliases = field.aliases ? [...field.aliases] : [];
  if (!aliases.includes(alias)) aliases.push(alias);
  return { ...field, aliases };
}

function unaliasField(field, alias) {
  if (!field.aliases) return field;
  const aliases = field.aliases.filter(a => a !== alias);
  const updated = { ...field, aliases };
  if (aliases.length === 0) delete updated.aliases;
  return updated;
}

function listAliases(field) {
  return field.aliases || [];
}

function aliasSchema(schema, fieldName, alias) {
  const fields = schema.fields.map(f =>
    f.name === fieldName ? aliasField(f, alias) : f
  );
  return { ...schema, fields };
}

function unaliasSchema(schema, fieldName, alias) {
  const fields = schema.fields.map(f =>
    f.name === fieldName ? unaliasField(f, alias) : f
  );
  return { ...schema, fields };
}

function listSchemaAliases(schema) {
  const result = {};
  for (const field of schema.fields) {
    if (field.aliases && field.aliases.length > 0) {
      result[field.name] = field.aliases;
    }
  }
  return result;
}

module.exports = { aliasField, unaliasField, listAliases, aliasSchema, unaliasSchema, listSchemaAliases };
