const fs = require('fs');
const path = require('path');
const os = require('os');
const { publishSchema, unpublishSchema, isPublished, listPublished } = require('../../src/schema/publisher');

const baseSchema = { title: 'Contact Form', fields: [{ name: 'email', type: 'email' }] };

describe('publishSchema', () => {
  it('marks schema as published with default channel', () => {
    const result = publishSchema(baseSchema);
    expect(result.published).toBe(true);
    expect(result.publishChannel).toBe('default');
    expect(typeof result.publishedAt).toBe('string');
  });

  it('marks schema as published with custom channel', () => {
    const result = publishSchema(baseSchema, 'production');
    expect(result.publishChannel).toBe('production');
  });

  it('does not mutate original schema', () => {
    publishSchema(baseSchema);
    expect(baseSchema.published).toBeUndefined();
  });

  it('throws on invalid schema', () => {
    expect(() => publishSchema(null)).toThrow('Invalid schema');
    expect(() => publishSchema('string')).toThrow('Invalid schema');
  });
});

describe('unpublishSchema', () => {
  it('removes publication metadata', () => {
    const published = publishSchema(baseSchema, 'staging');
    const result = unpublishSchema(published);
    expect(result.published).toBeUndefined();
    expect(result.publishedAt).toBeUndefined();
    expect(result.publishChannel).toBeUndefined();
  });

  it('preserves other fields', () => {
    const published = publishSchema(baseSchema);
    const result = unpublishSchema(published);
    expect(result.title).toBe('Contact Form');
    expect(result.fields).toEqual(baseSchema.fields);
  });

  it('throws on invalid schema', () => {
    expect(() => unpublishSchema(null)).toThrow('Invalid schema');
  });
});

describe('isPublished', () => {
  it('returns true for published schema', () => {
    expect(isPublished(publishSchema(baseSchema))).toBe(true);
  });

  it('returns false for unpublished schema', () => {
    expect(isPublished(baseSchema)).toBe(false);
  });

  it('returns false for null', () => {
    expect(isPublished(null)).toBe(false);
  });
});

describe('listPublished', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'publisher-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns only published schemas from directory', () => {
    const pub = publishSchema(baseSchema);
    const unpub = unpublishSchema(pub);
    fs.writeFileSync(path.join(tmpDir, 'a.json'), JSON.stringify(pub));
    fs.writeFileSync(path.join(tmpDir, 'b.json'), JSON.stringify(unpub));
    const results = listPublished(tmpDir);
    expect(results).toHaveLength(1);
    expect(results[0].file).toBe('a.json');
  });

  it('returns empty array for non-existent directory', () => {
    expect(listPublished('/no/such/dir')).toEqual([]);
  });

  it('skips malformed JSON files gracefully', () => {
    fs.writeFileSync(path.join(tmpDir, 'bad.json'), 'not json');
    expect(listPublished(tmpDir)).toEqual([]);
  });
});
