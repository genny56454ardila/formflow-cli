// pinner.js — pin/unpin fields so they appear first in schema output

function pinField(field) {
  return { ...field, pinned: true };
}

function unpinField(field) {
  const f = { ...field };
  delete f.pinned;
  return f;
}

function pinFieldInSchema(schema, fieldName) {
  const fields = schema.fields.map(f =>
    f.name === fieldName ? pinField(f) : f
  );
  if (!fields.find(f => f.name === fieldName)) {
    throw new Error(`Field "${fieldName}" not found in schema`);
  }
  return { ...schema, fields };
}

function unpinFieldInSchema(schema, fieldName) {
  const fields = schema.fields.map(f =>
    f.name === fieldName ? unpinField(f) : f
  );
  if (!fields.find(f => f.name === fieldName)) {
    throw new Error(`Field "${fieldName}" not found in schema`);
  }
  return { ...schema, fields };
}

function listPinnedFields(schema) {
  return schema.fields.filter(f => f.pinned === true).map(f => f.name);
}

function applyPinOrder(schema) {
  const pinned = schema.fields.filter(f => f.pinned);
  const unpinned = schema.fields.filter(f => !f.pinned);
  return { ...schema, fields: [...pinned, ...unpinned] };
}

module.exports = {
  pinField,
  unpinField,
  pinFieldInSchema,
  unpinFieldInSchema,
  listPinnedFields,
  applyPinOrder,
};
