const fs = require('fs');
const path = require('path');
const os = require('os');
const { duplicateSchemaField } = require('../../src/schema/duplicator');

describe('duplicateSchemaField (integration)', () => {
  let tmpDir;
  let schemaPath;

  const sampleSchema = {
    title: 'Registration Form',
    fields: [
      { name: 'username', type: 'text', required: true },
      { name: 'email', type: 'email', required: true },
      { name: 'password', type: 'password', required: true },
    ],
  };

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'formflow-dup-'));
    schemaPath = path.join(tmpDir, 'schema.json');
    fs.writeFileSync(schemaPath, JSON.stringify(sampleSchema, null, 2), 'utf8');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('loads schema from disk and returns updated schema with duplicated field', async () => {
    const result = await duplicateSchemaField(schemaPath, 'email', 'email_backup');
    expect(result.fields.length).toBe(4);
    const idx = result.fields.findIndex((f) => f.name === 'email');
    expect(result.fields[idx + 1].name).toBe('email_backup');
    expect(result.fields[idx + 1].type).toBe('email');
  });

  it('preserves schema title and other fields', async () => {
    const result = await duplicateSchemaField(schemaPath, 'username', 'username_copy');
    expect(result.title).toBe('Registration Form');
    expect(result.fields.some((f) => f.name === 'password')).toBe(true);
  });

  it('throws when the source field does not exist in the file', async () => {
    await expect(
      duplicateSchemaField(schemaPath, 'nonexistent', 'copy')
    ).rejects.toThrow('Field "nonexistent" not found');
  });

  it('throws when the new name already exists in the file', async () => {
    await expect(
      duplicateSchemaField(schemaPath, 'email', 'password')
    ).rejects.toThrow('Field "password" already exists');
  });

  it('does not mutate the original schema file on disk', async () => {
    await duplicateSchemaField(schemaPath, 'email', 'email_backup');
    const onDisk = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    expect(onDisk.fields.length).toBe(3);
    expect(onDisk.fields.some((f) => f.name === 'email_backup')).toBe(false);
  });
});
