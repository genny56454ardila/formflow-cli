const chalk = require('chalk');

function highlightField(field, term) {
  if (!term) return field;
  const regex = new RegExp(`(${term})`, 'gi');
  const highlighted = {};
  for (const [key, value] of Object.entries(field)) {
    if (typeof value === 'string' && regex.test(value)) {
      highlighted[key] = value.replace(regex, (match) => chalk.bgYellow.black(match));
    } else {
      highlighted[key] = value;
    }
  }
  return highlighted;
}

function highlightSchema(schema, term) {
  if (!schema || !Array.isArray(schema.fields)) {
    throw new Error('Invalid schema: missing fields array');
  }
  if (!term || term.trim() === '') return schema;
  return {
    ...schema,
    fields: schema.fields.map((field) => highlightField(field, term)),
  };
}

function formatHighlighted(schema, term) {
  const result = highlightSchema(schema, term);
  const lines = result.fields.map((field) => {
    const name = field.name || '(unnamed)';
    const type = field.type || 'unknown';
    const label = field.label ? ` — ${field.label}` : '';
    return `  ${chalk.bold(name)} [${type}]${label}`;
  });
  const header = chalk.cyan(`Schema: ${result.name || 'untitled'} (${result.fields.length} fields)`);
  return [header, ...lines].join('\n');
}

module.exports = { highlightField, highlightSchema, formatHighlighted };
