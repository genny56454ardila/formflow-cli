// auditor.js — tracks access and modification events on schema fields

const AUDIT_ACTIONS = ['read', 'write', 'delete', 'validate', 'export'];

function createAuditEntry(fieldName, action, meta = {}) {
  if (!AUDIT_ACTIONS.includes(action)) {
    throw new Error(`Unknown audit action: "${action}". Must be one of: ${AUDIT_ACTIONS.join(', ')}`);
  }
  return {
    fieldName,
    action,
    timestamp: new Date().toISOString(),
    ...meta,
  };
}

function auditField(field, action, meta = {}) {
  if (!field || typeof field.name !== 'string') {
    throw new Error('Invalid field: must have a string "name" property');
  }
  const entry = createAuditEntry(field.name, action, meta);
  const log = field.auditLog ? [...field.auditLog, entry] : [entry];
  return { ...field, auditLog: log };
}

function auditSchema(schema, action, fieldNames = null, meta = {}) {
  if (!schema || !Array.isArray(schema.fields)) {
    throw new Error('Invalid schema: must have a "fields" array');
  }
  const targets = fieldNames
    ? schema.fields.filter(f => fieldNames.includes(f.name))
    : schema.fields;

  if (fieldNames && targets.length !== fieldNames.length) {
    const found = targets.map(f => f.name);
    const missing = fieldNames.filter(n => !found.includes(n));
    throw new Error(`Fields not found in schema: ${missing.join(', ')}`);
  }

  const targetSet = new Set(targets.map(f => f.name));
  const updatedFields = schema.fields.map(f =>
    targetSet.has(f.name) ? auditField(f, action, meta) : f
  );
  return { ...schema, fields: updatedFields };
}

function getAuditLog(field) {
  if (!field || typeof field.name !== 'string') {
    throw new Error('Invalid field: must have a string "name" property');
  }
  return field.auditLog || [];
}

function clearAuditLog(field) {
  if (!field || typeof field.name !== 'string') {
    throw new Error('Invalid field: must have a string "name" property');
  }
  const { auditLog, ...rest } = field;
  return rest;
}

function formatAuditLog(field) {
  const log = getAuditLog(field);
  if (log.length === 0) return `No audit entries for field "${field.name}".`;
  const lines = log.map(
    (e, i) => `  [${i + 1}] ${e.action.toUpperCase()} @ ${e.timestamp}${e.user ? ` by ${e.user}` : ''}`
  );
  return [`Audit log for "${field.name}":`, ...lines].join('\n');
}

module.exports = {
  auditField,
  auditSchema,
  getAuditLog,
  clearAuditLog,
  formatAuditLog,
};
