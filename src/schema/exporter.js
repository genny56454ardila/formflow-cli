const fs = require('fs');
const path = require('path');
const { serializeSchema } = require('./generator');
const { formatErrors } = require('./formatter');

/**
 * Supported export formats
 */
const EXPORT_FORMATS = ['json', 'html', 'markdown'];

/**
 * Export schema to JSON format
 * @param {object} schema
 * @returns {string}
 */
function toJSON(schema) {
  return JSON.stringify(serializeSchema(schema), null, 2);
}

/**
 * Export schema to basic HTML form
 * @param {object} schema
 * @returns {string}
 */
function toHTML(schema) {
  const fields = schema.fields || [];
  const formTitle = schema.title || 'Form';

  const fieldHTML = fields.map((field) => {
    const required = field.required ? 'required' : '';
    const label = `<label for="${field.name}">${field.label || field.name}</label>`;
    const input = `<input type="${field.type || 'text'}" id="${field.name}" name="${field.name}" ${required} />`;
    return `  <div class="field">\n    ${label}\n    ${input}\n  </div>`;
  }).join('\n');

  return `<!DOCTYPE html>\n<html>\n<head><title>${formTitle}</title></head>\n<body>\n<h1>${formTitle}</h1>\n<form>\n${fieldHTML}\n  <button type="submit">Submit</button>\n</form>\n</body>\n</html>`;
}

/**
 * Export schema to Markdown documentation
 * @param {object} schema
 * @returns {string}
 */
function toMarkdown(schema) {
  const fields = schema.fields || [];
  const title = schema.title || 'Form Schema';

  const rows = fields.map((field) => {
    const required = field.required ? 'Yes' : 'No';
    return `| ${field.name} | ${field.type || 'text'} | ${required} | ${field.label || ''} |`;
  }).join('\n');

  return `# ${title}\n\n${schema.description ? schema.description + '\n\n' : ''}## Fields\n\n| Name | Type | Required | Label |\n|------|------|----------|-------|\n${rows}\n`;
}

/**
 * Export schema to a file
 * @param {object} schema
 * @param {string} outputPath
 * @param {string} format
 * @returns {{ success: boolean, message: string }}
 */
function exportSchema(schema, outputPath, format = 'json') {
  if (!EXPORT_FORMATS.includes(format)) {
    return { success: false, message: `Unsupported format: ${format}. Use one of: ${EXPORT_FORMATS.join(', ')}` };
  }

  let content;
  if (format === 'json') content = toJSON(schema);
  else if (format === 'html') content = toHTML(schema);
  else if (format === 'markdown') content = toMarkdown(schema);

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, content, 'utf8');
  return { success: true, message: `Schema exported to ${outputPath} as ${format}` };
}

module.exports = { exportSchema, toJSON, toHTML, toMarkdown, EXPORT_FORMATS };
