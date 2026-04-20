// deprecator.js — mark/unmark fields as deprecated in a schema

function deprecateField(field, reason = '') {
  return { ...field, deprecated: true, deprecationReason: reason || 'No reason provided' };
}

function undeprecateField(field) {
  const { deprecated, deprecationReason, ...rest } = field;
  return rest;
}

function deprecateSchema(schema, fieldNames, reason = '') {
  return {
    ...schema,
    fields: schema.fields.map(f =>
      fieldNames.includes(f.name) ? deprecateField(f, reason) : f
    )
  };
}

function undeprecateSchema(schema, fieldNames) {
  return {
    ...schema,
    fields: schema.fields.map(f =>
      fieldNames.includes(f.name) ? undeprecateField(f) : f
    )
  };
}

function listDeprecated(schema) {
  return schema.fields.filter(f => f.deprecated === true);
}

function formatDeprecated(fields) {
  if (!fields.length) return 'No deprecated fields.';
  return fields
    .map(f => `  [DEPRECATED] ${f.name}: ${f.deprecationReason}`)
    .join('\n');
}

module.exports = { deprecateField, undeprecateField, deprecateSchema, undeprecateSchema, listDeprecated, formatDeprecated };
