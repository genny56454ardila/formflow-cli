// maps field names/keys from one schema to another using a mapping config

function mapField(field, mapping) {
  if (!mapping || typeof mapping !== 'object') return { ...field };
  const mapped = { ...field };
  if (mapping.name && field.name === mapping.from) {
    mapped.name = mapping.to;
  }
  if (mapping.type) {
    mapped.type = mapping.type;
  }
  return mapped;
}

function mapFields(fields, mappings) {
  if (!Array.isArray(fields)) throw new Error('fields must be an array');
  if (!Array.isArray(mappings)) throw new Error('mappings must be an array');

  return fields.map(field => {
    const match = mappings.find(m => m.from === field.name);
    if (!match) return { ...field };
    return {
      ...field,
      name: match.to !== undefined ? match.to : field.name,
      type: match.type !== undefined ? match.type : field.type,
      label: match.label !== undefined ? match.label : field.label,
    };
  });
}

function mapSchema(schema, mappings) {
  if (!schema || !Array.isArray(schema.fields)) throw new Error('invalid schema');
  return {
    ...schema,
    fields: mapFields(schema.fields, mappings),
  };
}

module.exports = { mapField, mapFields, mapSchema };
