const {
  addReference,
  removeReference,
  listReferences,
  addReferenceInSchema,
  removeReferenceInSchema,
  listAllReferences
} = require('../../src/schema/referencer');

const baseField = { name: 'email', type: 'text' };
const baseSchema = {
  name: 'Contact',
  fields: [
    { name: 'email', type: 'text' },
    { name: 'phone', type: 'text' }
  ]
};

describe('addReference', () => {
  it('adds a ref to a field with no existing refs', () => {
    const result = addReference(baseField, 'RFC5322', 'Email format spec');
    expect(result.refs).toHaveLength(1);
    expect(result.refs[0]).toEqual({ id: 'RFC5322', description: 'Email format spec' });
  });

  it('does not duplicate an existing ref', () => {
    const field = addReference(baseField, 'RFC5322');
    const result = addReference(field, 'RFC5322');
    expect(result.refs).toHaveLength(1);
  });

  it('throws if refId is missing', () => {
    expect(() => addReference(baseField, '')).toThrow('refId must be a non-empty string');
  });

  it('does not mutate the original field', () => {
    addReference(baseField, 'RFC5322');
    expect(baseField.refs).toBeUndefined();
  });
});

describe('removeReference', () => {
  it('removes an existing ref', () => {
    const field = addReference(baseField, 'RFC5322');
    const result = removeReference(field, 'RFC5322');
    expect(result.refs).toHaveLength(0);
  });

  it('returns field unchanged if no refs', () => {
    const result = removeReference(baseField, 'RFC5322');
    expect(result.refs).toBeUndefined();
  });
});

describe('listReferences', () => {
  it('returns empty array for field with no refs', () => {
    expect(listReferences(baseField)).toEqual([]);
  });

  it('returns refs array', () => {
    const field = addReference(baseField, 'RFC5322', 'Email spec');
    expect(listReferences(field)).toHaveLength(1);
  });
});

describe('addReferenceInSchema', () => {
  it('adds ref to the correct field', () => {
    const result = addReferenceInSchema(baseSchema, 'email', 'RFC5322');
    const emailField = result.fields.find(f => f.name === 'email');
    expect(emailField.refs).toHaveLength(1);
  });

  it('leaves other fields untouched', () => {
    const result = addReferenceInSchema(baseSchema, 'email', 'RFC5322');
    const phoneField = result.fields.find(f => f.name === 'phone');
    expect(phoneField.refs).toBeUndefined();
  });
});

describe('removeReferenceInSchema', () => {
  it('removes ref from the correct field', () => {
    let schema = addReferenceInSchema(baseSchema, 'email', 'RFC5322');
    schema = removeReferenceInSchema(schema, 'email', 'RFC5322');
    const emailField = schema.fields.find(f => f.name === 'email');
    expect(emailField.refs).toHaveLength(0);
  });
});

describe('listAllReferences', () => {
  it('returns all unique ref IDs across the schema', () => {
    let schema = addReferenceInSchema(baseSchema, 'email', 'RFC5322');
    schema = addReferenceInSchema(schema, 'phone', 'E164');
    schema = addReferenceInSchema(schema, 'email', 'E164');
    const refs = listAllReferences(schema);
    expect(refs).toContain('RFC5322');
    expect(refs).toContain('E164');
    expect(refs).toHaveLength(2);
  });

  it('returns empty array for schema with no refs', () => {
    expect(listAllReferences(baseSchema)).toEqual([]);
  });
});
