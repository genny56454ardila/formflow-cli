// splits a schema into multiple schemas based on a field predicate or group key

function splitFields(fields, predicate) {
  const matched = [];
  const rest = [];
  for (const field of fields) {
    if (predicate(field)) {
      matched.push(field);
    } else {
      rest.push(field);
    }
  }
  return { matched, rest };
}

function splitSchema(schema, predicate) {
  const { matched, rest } = splitFields(schema.fields || [], predicate);
  return [
    { ...schema, fields: matched },
    { ...schema, fields: rest },
  ];
}

function splitSchemaByGroup(schema) {
  const groups = {};
  for (const field of schema.fields || []) {
    const key = field.group || '__ungrouped';
    if (!groups[key]) groups[key] = [];
    groups[key].push(field);
  }
  return Object.entries(groups).reduce((acc, [key, fields]) => {
    acc[key] = { ...schema, fields };
    return acc;
  }, {});
}

module.exports = { splitFields, splitSchema, splitSchemaByGroup };
