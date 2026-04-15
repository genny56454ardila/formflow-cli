const renameField = (field, nameMap) => {
  if (!field || typeof field !== 'object') {
    throw new Error('Invalid field object');
  }
  if (!nameMap || typeof nameMap !== 'object') {
    throw new Error('Invalid name map');
  }

  const newName = nameMap[field.name];
  if (!newName) return { ...field };

  return {
    ...field,
    name: newName,
    label: field.label === field.name ? newName : field.label,
  };
};

const renameSchema = (schema, nameMap) => {
  if (!schema || typeof schema !== 'object') {
    throw new Error('Invalid schema object');
  }
  if (!Array.isArray(schema.fields)) {
    throw new Error('Schema must have a fields array');
  }
  if (!nameMap || typeof nameMap !== 'object') {
    throw new Error('Invalid name map');
  }

  const renamed = [];
  const conflicts = [];
  const usedNames = new Set(
    schema.fields
      .map((f) => (nameMap[f.name] ? null : f.name))
      .filter(Boolean)
  );

  for (const field of schema.fields) {
    const target = nameMap[field.name];
    if (target && usedNames.has(target)) {
      conflicts.push({ from: field.name, to: target });
    } else {
      if (target) usedNames.add(target);
      renamed.push(renameField(field, nameMap));
    }
  }

  return {
    schema: { ...schema, fields: renamed },
    conflicts,
    renamedCount: renamed.filter((f) => nameMap[schema.fields.find((o) => o.name === f.name || nameMap[o.name] === f.name)?.name]).length,
  };
};

module.exports = { renameField, renameSchema };
