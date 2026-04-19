// tracks field-level change history within a schema

function trackChange(field, action, meta = {}) {
  const entry = {
    action,
    timestamp: meta.timestamp || new Date().toISOString(),
    by: meta.by || 'unknown',
  };
  const history = Array.isArray(field._history) ? [...field._history] : [];
  return { ...field, _history: [...history, entry] };
}

function getHistory(field) {
  return Array.isArray(field._history) ? field._history : [];
}

function clearHistory(field) {
  const { _history, ...rest } = field;
  return rest;
}

function trackSchema(schema, action, meta = {}) {
  return {
    ...schema,
    fields: schema.fields.map(f => trackChange(f, action, meta)),
  };
}

function clearSchemaHistory(schema) {
  return {
    ...schema,
    fields: schema.fields.map(clearHistory),
  };
}

function formatHistory(field) {
  const history = getHistory(field);
  if (history.length === 0) return `${field.name}: no history`;
  const lines = history.map(
    (e, i) => `  ${i + 1}. [${e.timestamp}] ${e.action} by ${e.by}`
  );
  return [`${field.name}:`, ...lines].join('\n');
}

module.exports = {
  trackChange,
  getHistory,
  clearHistory,
  trackSchema,
  clearSchemaHistory,
  formatHistory,
};
