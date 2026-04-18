// freezer.js — freeze/unfreeze schema fields to prevent modification

function freezeField(field) {
  if (!field || typeof field !== 'object') throw new Error('Invalid field');
  return { ...field, frozen: true };
}

function unfreezeField(field) {
  if (!field || typeof field !== 'object') throw new Error('Invalid field');
  const result = { ...field };
  delete result.frozen;
  return result;
}

function freezeSchema(schema, fieldNames = null) {
  if (!schema || !Array.isArray(schema.fields)) throw new Error('Invalid schema');
  const fields = schema.fields.map(f => {
    if (fieldNames === null || fieldNames.includes(f.name)) {
      return freezeField(f);
    }
    return f;
  });
  return { ...schema, fields };
}

function unfreezeSchema(schema, fieldNames = null) {
  if (!schema || !Array.isArray(schema.fields)) throw new Error('Invalid schema');
  const fields = schema.fields.map(f => {
    if (fieldNames === null || fieldNames.includes(f.name)) {
      return unfreezeField(f);
    }
    return f;
  });
  return { ...schema, fields };
}

function listFrozenFields(schema) {
  if (!schema || !Array.isArray(schema.fields)) throw new Error('Invalid schema');
  return schema.fields.filter(f => f.frozen === true).map(f => f.name);
}

module.exports = { freezeField, unfreezeField, freezeSchema, unfreezeSchema, listFrozenFields };
