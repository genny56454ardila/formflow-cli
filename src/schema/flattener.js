const flattenField = (field, prefix = '') => {
  const key = prefix ? `${prefix}.${field.name}` : field.name;
  const flat = [{ ...field, name: key }];

  if (field.fields && Array.isArray(field.fields)) {
    for (const child of field.fields) {
      flat.push(...flattenField(child, key));
    }
    flat[0] = { ...flat[0], fields: undefined };
    delete flat[0].fields;
  }

  return flat;
};

const flattenSchema = (schema) => {
  if (!schema || !Array.isArray(schema.fields)) {
    throw new Error('Invalid schema: missing fields array');
  }

  const flatFields = [];
  for (const field of schema.fields) {
    flatFields.push(...flattenField(field));
  }

  return { ...schema, fields: flatFields };
};

const unflattenSchema = (schema) => {
  if (!schema || !Array.isArray(schema.fields)) {
    throw new Error('Invalid schema: missing fields array');
  }

  const root = {};

  for (const field of schema.fields) {
    const parts = field.name.split('.');
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]]) node[parts[i]] = { _children: {} };
      node = node[parts[i]]._children;
    }
    const leaf = parts[parts.length - 1];
    node[leaf] = { ...field, name: leaf, _children: node[leaf]?._children || {} };
  }

  const buildFields = (node) =>
    Object.values(node).map((entry) => {
      const { _children, ...rest } = entry;
      const children = buildFields(_children);
      return children.length ? { ...rest, fields: children } : rest;
    });

  return { ...schema, fields: buildFields(root) };
};

module.exports = { flattenField, flattenSchema, unflattenSchema };
