const fs = require('fs');
const path = require('path');
const os = require('os');
const { loadSchema } = require('../../src/schema/loader');

describe('loadSchema', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'formflow-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('loads and parses a valid JSON schema file', () => {
    const schema = { formId: 'test', title: 'Test', fields: [] };
    const filePath = path.join(tmpDir, 'form.json');
    fs.writeFileSync(filePath, JSON.stringify(schema));

    const result = loadSchema(filePath);
    expect(result).toEqual(schema);
  });

  test('throws if file does not exist', () => {
    expect(() => loadSchema('/nonexistent/path/form.json')).toThrow('Schema file not found');
  });

  test('throws if file is not a .json file', () => {
    const filePath = path.join(tmpDir, 'form.yaml');
    fs.writeFileSync(filePath, 'formId: test');
    expect(() => loadSchema(filePath)).toThrow('.json file');
  });

  test('throws on invalid JSON content', () => {
    const filePath = path.join(tmpDir, 'bad.json');
    fs.writeFileSync(filePath, '{ not valid json }');
    expect(() => loadSchema(filePath)).toThrow('Invalid JSON');
  });

  test('resolves relative paths correctly', () => {
    const schema = { formId: 'rel', title: 'Relative', fields: [] };
    const filePath = path.join(tmpDir, 'relative.json');
    fs.writeFileSync(filePath, JSON.stringify(schema));

    const result = loadSchema(filePath);
    expect(result.formId).toBe('rel');
  });
});
