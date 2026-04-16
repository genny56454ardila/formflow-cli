const { schemaStats } = require('./stats');

/**
 * Generate a human-readable summary of a schema
 * @param {object} schema
 * @returns {object} summary
 */
function summarizeSchema(schema) {
  if (!schema || !Array.isArray(schema.fields)) {
    throw new Error('Invalid schema: missing fields array');
  }

  const stats = schemaStats(schema);
  const typeBreakdown = {};

  for (const field of schema.fields) {
    const type = field.type || 'unknown';
    typeBreakdown[type] = (typeBreakdown[type] || 0) + 1;
  }

  const requiredFields = schema.fields
    .filter(f => f.required)
    .map(f => f.name);

  const optionalFields = schema.fields
    .filter(f => !f.required)
    .map(f => f.name);

  return {
    name: schema.name || 'Unnamed Schema',
    version: schema.version || null,
    totalFields: stats.totalFields,
    requiredCount: requiredFields.length,
    optionalCount: optionalFields.length,
    typeBreakdown,
    requiredFields,
    optionalFields,
    hasValidation: schema.fields.some(f => f.validation),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Format a summary as a printable string
 * @param {object} summary
 * @returns {string}
 */
function formatSummary(summary) {
  const lines = [
    `Schema: ${summary.name}`,
    summary.version ? `Version: ${summary.version}` : null,
    `Total Fields: ${summary.totalFields}`,
    `  Required: ${summary.requiredCount}`,
    `  Optional: ${summary.optionalCount}`,
    `Has Validation Rules: ${summary.hasValidation ? 'Yes' : 'No'}`,
    '',
    'Type Breakdown:',
    ...Object.entries(summary.typeBreakdown).map(
      ([type, count]) => `  ${type}: ${count}`
    ),
  ].filter(l => l !== null);

  return lines.join('\n');
}

module.exports = { summarizeSchema, formatSummary };
