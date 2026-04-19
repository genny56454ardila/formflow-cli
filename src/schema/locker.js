// locker.js — lock/unlock fields to prevent modification

function lockField(field) {
  return { ...field, locked: true };
}

function unlockField(field) {
  const f = { ...field };
  delete f.locked;
  return f;
}

function lockFieldInSchema(schema, fieldName) {
  const fields = schema.fields || [];
  const found = fields.some(f => f.name === fieldName);
  if (!found) throw new Error(`Field "${fieldName}" not found in schema`);
  return {
    ...schema,
    fields: fields.map(f => f.name === fieldName ? lockField(f) : f)
  };
}

function unlockFieldInSchema(schema, fieldName) {
  const fields = schema.fields || [];
  const found = fields.some(f => f.name === fieldName);
  if (!found) throw new Error(`Field "${fieldName}" not found in schema`);
  return {
    ...schema,
    fields: fields.map(f => f.name === fieldName ? unlockField(f) : f)
  };
}

function listLockedFields(schema) {
  return (schema.fields || []).filter(f => f.locked === true).map(f => f.name);
}

module.exports = { lockField, unlockField, lockFieldInSchema, unlockFieldInSchema, listLockedFields };
