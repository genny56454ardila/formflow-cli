const { validateSchema } = require('./validator');

/**
 * Compare two field objects and return a similarity score (0-1)
 */
function compareFields(fieldA, fieldB) {
  if (!fieldA || !fieldB) return 0;

  let score = 0;
  let checks = 0;

  const props = ['type', 'required', 'label', 'placeholder', 'defaultValue'];
  for (const prop of props) {
    checks++;
    if (fieldA[prop] === fieldB[prop]) score++;
  }

  if (Array.isArray(fieldA.options) && Array.isArray(fieldB.options)) {
    checks++;
    const aVals = fieldA.options.map(o => o.value).sort().join(',');
    const bVals = fieldB.options.map(o => o.value).sort().join(',');
    if (aVals === bVals) score++;
  }

  if (Array.isArray(fieldA.validators) && Array.isArray(fieldB.validators)) {
    checks++;
    const aV = [...fieldA.validators].sort().join(',');
    const bV = [...fieldB.validators].sort().join(',');
    if (aV === bV) score++;
  }

  return checks === 0 ? 0 : parseFloat((score / checks).toFixed(2));
}

/**
 * Compare two schemas and return per-field similarity and an overall score
 */
function compareSchemas(schemaA, schemaB) {
  const errors = [
    ...validateSchema(schemaA).map(e => `Schema A: ${e}`),
    ...validateSchema(schemaB).map(e => `Schema B: ${e}`),
  ];
  if (errors.length) throw new Error(errors.join('; '));

  const fieldsA = schemaA.fields || [];
  const fieldsB = schemaB.fields || [];

  const allNames = [...new Set([
    ...fieldsA.map(f => f.name),
    ...fieldsB.map(f => f.name),
  ])];

  const fieldComparisons = allNames.map(name => {
    const a = fieldsA.find(f => f.name === name) || null;
    const b = fieldsB.find(f => f.name === name) || null;
    const similarity = compareFields(a, b);
    return { name, inA: !!a, inB: !!b, similarity };
  });

  const total = fieldComparisons.reduce((sum, f) => sum + f.similarity, 0);
  const overallSimilarity = allNames.length
    ? parseFloat((total / allNames.length).toFixed(2))
    : 1;

  return { fieldComparisons, overallSimilarity };
}

module.exports = { compareFields, compareSchemas };
