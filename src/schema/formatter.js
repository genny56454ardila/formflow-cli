/**
 * formatter.js
 * Handles formatting and pretty-printing of form schemas for CLI output
 */

const chalk = require('chalk');

/**
 * Formats a field entry for display
 * @param {Object} field - A single field definition
 * @param {number} index - Field index
 * @returns {string}
 */
function formatField(field, index) {
  const lines = [];
  lines.push(`  ${chalk.cyan(`[${index + 1}]`)} ${chalk.bold(field.name)} ${chalk.gray(`(${field.type})`)}}`);

  if (field.label) {
    lines.push(`       Label: ${field.label}`);
  }
  if (field.required) {
    lines.push(`       ${chalk.yellow('Required')}`);
  }
  if (field.placeholder) {
    lines.push(`       Placeholder: ${chalk.italic(field.placeholder)}`);
  }
  if (field.validation) {
    const rules = Object.entries(field.validation)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    lines.push(`       Validation: ${chalk.magenta(rules)}`);
  }

  return lines.join('\n');
}

/**
 * Formats an entire schema object for human-readable CLI output
 * @param {Object} schema - The full form schema
 * @returns {string}
 */
function formatSchema(schema) {
  if (!schema || typeof schema !== 'object') {
    throw new Error('Invalid schema: expected an object');
  }

  const lines = [];

  lines.push(chalk.green.bold(`\nForm Schema: ${schema.name || 'Unnamed Form'}`));

  if (schema.description) {
    lines.push(chalk.gray(`Description: ${schema.description}`));
  }

  lines.push(chalk.gray(`Version: ${schema.version || '1.0.0'}`));
  lines.push('');

  const fields = schema.fields || [];
  if (fields.length === 0) {
    lines.push(chalk.yellow('  No fields defined.'));
  } else {
    lines.push(chalk.underline(`Fields (${fields.length}):`))
    fields.forEach((field, i) => {
      lines.push(formatField(field, i));
    });
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Formats validation errors into a readable list
 * @param {string[]} errors - Array of error messages
 * @returns {string}
 */
function formatErrors(errors) {
  if (!errors || errors.length === 0) {
    return chalk.green('✔ Schema is valid.');
  }

  const lines = [chalk.red.bold(`✖ Schema has ${errors.length} error(s):`)]
  errors.forEach((err, i) => {
    lines.push(`  ${chalk.red(`${i + 1}.`)} ${err}`);
  });

  return lines.join('\n');
}

module.exports = { formatSchema, formatField, formatErrors };
