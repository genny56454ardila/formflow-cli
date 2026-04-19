// Scores a schema based on completeness and quality heuristics

function scoreField(field) {
  let score = 0;
  const issues = [];

  if (field.label && field.label.trim().length > 0) score += 20;
  else issues.push('missing label');

  if (field.type) score += 20;
  else issues.push('missing type');

  if (field.name && field.name.trim().length > 0) score += 20;
  else issues.push('missing name');

  if (field.placeholder) score += 10;
  if (field.description) score += 15;
  if (field.validation) score += 15;

  return { score, issues };
}

function scoreSchema(schema) {
  if (!schema || !Array.isArray(schema.fields) || schema.fields.length === 0) {
    return { total: 0, average: 0, fields: [], grade: 'F' };
  }

  const fieldScores = schema.fields.map((field) => {
    const { score, issues } = scoreField(field);
    return { name: field.name || '(unnamed)', score, issues };
  });

  const total = fieldScores.reduce((sum, f) => sum + f.score, 0);
  const average = Math.round(total / fieldScores.length);

  const grade =
    average >= 90 ? 'A' :
    average >= 75 ? 'B' :
    average >= 60 ? 'C' :
    average >= 40 ? 'D' : 'F';

  return { total, average, fields: fieldScores, grade };
}

function formatScore(result) {
  const lines = [
    `Schema Score: ${result.average}/100 (${result.grade})`,
    '',
    'Field Breakdown:',
  ];

  for (const f of result.fields) {
    lines.push(`  ${f.name}: ${f.score}/100`);
    for (const issue of f.issues) {
      lines.push(`    - ${issue}`);
    }
  }

  return lines.join('\n');
}

module.exports = { scoreField, scoreSchema, formatScore };
