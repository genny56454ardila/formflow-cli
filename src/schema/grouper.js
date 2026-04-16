// Groups fields by a given property (e.g., type, tag, section)

function groupFields(fields, groupBy = 'type') {
  if (!Array.isArray(fields)) throw new Error('fields must be an array');
  return fields.reduce((groups, field) => {
    const key = field[groupBy] ?? '__ungrouped';
    if (!groups[key]) groups[key] = [];
    groups[key].push(field);
    return groups;
  }, {});
}

function groupSchema(schema, groupBy = 'type') {
  if (!schema || !Array.isArray(schema.fields)) {
    throw new Error('Invalid schema: missing fields array');
  }
  const grouped = groupFields(schema.fields, groupBy);
  return {
    ...schema,
    groups: grouped,
  };
}

function formatGroups(grouped) {
  const lines = [];
  for (const [key, fields] of Object.entries(grouped)) {
    lines.push(`[${key}]`);
    for (const field of fields) {
      lines.push(`  - ${field.name} (${field.type ?? 'unknown'})`);
    }
  }
  return lines.join('\n');
}

module.exports = { groupFields, groupSchema, formatGroups };
