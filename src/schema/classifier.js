/**
 * classifier.js — Classify schema fields by type, complexity, and category
 */

const FIELD_CATEGORIES = {
  text: ['text', 'textarea', 'email', 'url', 'password', 'search'],
  numeric: ['number', 'range', 'integer', 'float'],
  choice: ['select', 'radio', 'checkbox', 'multiselect'],
  temporal: ['date', 'time', 'datetime', 'month', 'week'],
  file: ['file', 'image', 'attachment'],
  structural: ['group', 'section', 'fieldset'],
  hidden: ['hidden'],
};

function classifyField(field) {
  if (!field || typeof field !== 'object') {
    throw new Error('Invalid field: must be a non-null object');
  }

  const type = (field.type || '').toLowerCase();
  let category = 'unknown';

  for (const [cat, types] of Object.entries(FIELD_CATEGORIES)) {
    if (types.includes(type)) {
      category = cat;
      break;
    }
  }

  const complexity = computeComplexity(field);

  return {
    ...field,
    _classification: {
      category,
      complexity,
      isRequired: Boolean(field.required),
      hasValidation: Boolean(field.validation || field.pattern || field.min || field.max),
      hasDefault: field.default !== undefined,
    },
  };
}

function computeComplexity(field) {
  let score = 0;
  if (field.required) score += 1;
  if (field.validation) score += 2;
  if (field.pattern) score += 1;
  if (field.options && field.options.length > 10) score += 1;
  if (field.dependencies && field.dependencies.length > 0) score += 2;
  if (field.transform) score += 1;
  if (score <= 1) return 'simple';
  if (score <= 4) return 'moderate';
  return 'complex';
}

function classifySchema(schema) {
  if (!schema || !Array.isArray(schema.fields)) {
    throw new Error('Invalid schema: must have a fields array');
  }

  const classifiedFields = schema.fields.map(classifyField);
  const summary = buildClassificationSummary(classifiedFields);

  return {
    ...schema,
    fields: classifiedFields,
    _classificationSummary: summary,
  };
}

function buildClassificationSummary(fields) {
  const summary = { categories: {}, complexities: { simple: 0, moderate: 0, complex: 0 }, total: fields.length };

  for (const field of fields) {
    const { category, complexity } = field._classification;
    summary.categories[category] = (summary.categories[category] || 0) + 1;
    summary.complexities[complexity] = (summary.complexities[complexity] || 0) + 1;
  }

  return summary;
}

module.exports = { classifyField, classifySchema, computeComplexity, buildClassificationSummary };
