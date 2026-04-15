const fs = require('fs');
const path = require('path');
const { exportSchema, toJSON, toHTML, toMarkdown, EXPORT_FORMATS } = require('../../src/schema/exporter');

const mockSchema = {
  title: 'Registration Form',
  description: 'User registration',
  fields: [
    { name: 'username', type: 'text', label: 'Username', required: true },
    { name: 'email', type: 'email', label: 'Email Address', required: true },
    { name: 'age', type: 'number', label: 'Age', required: false },
  ],
};

describe('EXPORT_FORMATS', () => {
  it('should include json, html, and markdown', () => {
    expect(EXPORT_FORMATS).toContain('json');
    expect(EXPORT_FORMATS).toContain('html');
    expect(EXPORT_FORMATS).toContain('markdown');
  });
});

describe('toJSON', () => {
  it('should return a valid JSON string', () => {
    const result = toJSON(mockSchema);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('should include field names in output', () => {
    const result = toJSON(mockSchema);
    expect(result).toContain('username');
    expect(result).toContain('email');
  });
});

describe('toHTML', () => {
  it('should return a string containing html tags', () => {
    const result = toHTML(mockSchema);
    expect(result).toContain('<form>');
    expect(result).toContain('</form>');
    expect(result).toContain('<input');
  });

  it('should include form title', () => {
    const result = toHTML(mockSchema);
    expect(result).toContain('Registration Form');
  });

  it('should mark required fields', () => {
    const result = toHTML(mockSchema);
    expect(result).toContain('required');
  });

  it('should handle schema with no fields', () => {
    const result = toHTML({ title: 'Empty Form', fields: [] });
    expect(result).toContain('<form>');
    expect(result).not.toContain('<input');
  });
});

describe('toMarkdown', () => {
  it('should include a markdown table', () => {
    const result = toMarkdown(mockSchema);
    expect(result).toContain('| Name | Type | Required | Label |');
    expect(result).toContain('username');
  });

  it('should include the schema title as heading', () => {
    const result = toMarkdown(mockSchema);
    expect(result).toContain('# Registration Form');
  });

  it('should include description if present', () => {
    const result = toMarkdown(mockSchema);
    expect(result).toContain('User registration');
  });
});

describe('exportSchema', () => {
  const tmpDir = path.join(__dirname, '../../tmp_test_exports');

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('should write a json file successfully', () => {
    const outPath = path.join(tmpDir, 'output.json');
    const result = exportSchema(mockSchema, outPath, 'json');
    expect(result.success).toBe(true);
    expect(fs.existsSync(outPath)).toBe(true);
  });

  it('should write an html file successfully', () => {
    const outPath = path.join(tmpDir, 'output.html');
    const result = exportSchema(mockSchema, outPath, 'html');
    expect(result.success).toBe(true);
    expect(fs.existsSync(outPath)).toBe(true);
  });

  it('should return error for unsupported format', () => {
    const result = exportSchema(mockSchema, '/tmp/out.xyz', 'xml');
    expect(result.success).toBe(false);
    expect(result.message).toContain('Unsupported format');
  });

  it('should create output directory if it does not exist', () => {
    const outPath = path.join(tmpDir, 'nested/dir/output.md');
    const result = exportSchema(mockSchema, outPath, 'markdown');
    expect(result.success).toBe(true);
    expect(fs.existsSync(outPath)).toBe(true);
  });
});
