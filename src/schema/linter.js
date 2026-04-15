/**
 * Schema linter — checks for style and best-practice issues
 * beyond strict validation (e.g. missing labels, duplicate ids, etc.)
 */

const LINT_RULES = {
  MISSING_LABEL: 'MISSING_LABEL',
  DUPLICATE_ID: 'DUPLICATE_ID',
  EMPTY_OPTIONS: 'EMPTY_OPTIONS',
  MISSING_PLACEHOLDER: 'MISSING_PLACEHOLDER',
  LONG_LABEL: 'LONG_LABEL',
};

function lintField(field, seenIds) {
  const warnings = [];

  if (!field.label || field.label.trim() === '') {
    warnings.push({ rule: LINT_RULES.MISSING_LABEL, field: field.id, message: `Field "${field.id}" is missing a label.` });
  }

  if (field.label && field.label.length > 80) {
    warnings.push({ rule: LINT_RULES.LONG_LABEL, field: field.id, message: `Field "${field.id}" has a label longer than 80 characters.` });
  }

  if (seenIds.has(field.id)) {
    warnings.push({ rule: LINT_RULES.DUPLICATE_ID, field: field.id, message: `Duplicate field id "${field.id}" detected.` });
  } else {
    seenIds.add(field.id);
  }

  if (['select', 'radio', 'checkbox'].includes(field.type)) {
    if (!field.options || field.options.length === 0) {
      warnings.push({ rule: LINT_RULES.EMPTY_OPTIONS, field: field.id, message: `Field "${field.id}" of type "${field.type}" has no options defined.` });
    }
  }

  if (['text', 'email', 'password', 'textarea'].includes(field.type) && !field.placeholder) {
    warnings.push({ rule: LINT_RULES.MISSING_PLACEHOLDER, field: field.id, message: `Field "${field.id}" is missing a placeholder.` });
  }

  return warnings;
}

function lintSchema(schema) {
  if (!schema || !Array.isArray(schema.fields)) {
    return [{ rule: 'INVALID_SCHEMA', field: null, message: 'Schema must have a fields array.' }];
  }

  const seenIds = new Set();
  const warnings = [];

  for (const field of schema.fields) {
    warnings.push(...lintField(field, seenIds));
  }

  return warnings;
}

module.exports = { lintField, lintSchema, LINT_RULES };
