const path = require('path');
const fs = require('fs');
const { runExport, resolveOutputPath } = require('../../src/commands/export');

const fixturesDir = path.join(__dirname, '../fixtures');
const validSchemaPath = path.join(fixturesDir, 'valid_schema.json');
const invalidSchemaPath = path.join(fixturesDir, 'invalid_schema.json');
const tmpDir = path.join(__dirname, '../../tmp_cmd_exports');

beforeAll(() => {
  if (!fs.existsSync(fixturesDir)) fs.mkdirSync(fixturesDir, { recursive: true });

  fs.writeFileSync(validSchemaPath, JSON.stringify({
    title: 'Test Form',
    fields: [
      { name: 'email', type: 'email', label: 'Email', required: true },
    ],
  }));

  fs.writeFileSync(invalidSchemaPath, JSON.stringify({ not_a_valid_schema: true }));
});

afterAll(() => {
  fs.rmSync(fixturesDir, { recursive: true, force: true });
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('resolveOutputPath', () => {
  it('should replace extension with format extension', () => {
    const result = resolveOutputPath('/some/dir/form.json', 'html');
    expect(result).toBe('/some/dir/form.html');
  });

  it('should use md extension for markdown format', () => {
    const result = resolveOutputPath('/some/dir/form.json', 'markdown');
    expect(result).toBe('/some/dir/form.md');
  });
});

describe('runExport', () => {
  it('should export a valid schema to json', () => {
    const output = path.join(tmpDir, 'out.json');
    const result = runExport(validSchemaPath, { format: 'json', output });
    expect(result.success).toBe(true);
    expect(fs.existsSync(output)).toBe(true);
  });

  it('should export a valid schema to html', () => {
    const output = path.join(tmpDir, 'out.html');
    const result = runExport(validSchemaPath, { format: 'html', output });
    expect(result.success).toBe(true);
  });

  it('should export a valid schema to markdown', () => {
    const output = path.join(tmpDir, 'out.md');
    const result = runExport(validSchemaPath, { format: 'markdown', output });
    expect(result.success).toBe(true);
  });

  it('should fail for unsupported format', () => {
    const result = runExport(validSchemaPath, { format: 'csv' });
    expect(result.success).toBe(false);
    expect(result.message).toContain('Unknown format');
  });

  it('should fail when schema file does not exist', () => {
    const result = runExport('/nonexistent/path.json', { format: 'json' });
    expect(result.success).toBe(false);
    expect(result.message).toContain('Failed to load schema');
  });

  it('should skip validation when skipValidation is true', () => {
    const output = path.join(tmpDir, 'skip_val.json');
    const result = runExport(invalidSchemaPath, { format: 'json', output, skipValidation: true });
    expect(result.success).toBe(true);
  });
});
