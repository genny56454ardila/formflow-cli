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

/**
 * Formats lint warnings into a human-readable string summary.
 * Useful for CLI output or logging.
 *
 * @param {Array} warnings - Array of warning objects returned by lintSchema
 * @returns {string} Formatted summary string
 */
function formatLintWarnings(warnings) {
  if (!warnings || warnings.length === 0) {
    return 'No lint warnings found.';
  }

  const lines = warnings.map(
    (w, i) => `  ${i + 1}. [${w.rule}]${w.field ? ` (${w.field})` : ''} ${w.message}`
  );

  return `Found ${warnings.length} lint warning(s):\n${lines.join('\n')}`;
}

module.exports = { lintField, lintSchema, formatLintWarnings, LINT_RULES };
