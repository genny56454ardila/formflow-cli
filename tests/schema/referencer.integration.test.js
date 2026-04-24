// Integration test: chaining reference operations on a schema
const {
  addReferenceInSchema,
  removeReferenceInSchema,
  listAllReferences
} = require('../../src/schema/referencer');

const baseSchema = {
  name: 'SignupForm',
  fields: [
    { name: 'username', type: 'text' },
    { name: 'email', type: 'text' },
    { name: 'password', type: 'password' }
  ]
};

describe('referencer integration', () => {
  it('adds multiple refs to multiple fields and lists them all', () => {
    let schema = addReferenceInSchema(baseSchema, 'email', 'RFC5322', 'Email spec');
    schema = addReferenceInSchema(schema, 'email', 'OWASP-INPUT', 'Input validation');
    schema = addReferenceInSchema(schema, 'password', 'NIST-800-63', 'Password guidelines');
    schema = addReferenceInSchema(schema, 'username', 'OWASP-INPUT', 'Input validation');

    const allRefs = listAllReferences(schema);
    expect(allRefs).toHaveLength(3);
    expect(allRefs).toContain('RFC5322');
    expect(allRefs).toContain('OWASP-INPUT');
    expect(allRefs).toContain('NIST-800-63');
  });

  it('removing a ref from one field does not affect the same ref on another field', () => {
    let schema = addReferenceInSchema(baseSchema, 'email', 'OWASP-INPUT');
    schema = addReferenceInSchema(schema, 'username', 'OWASP-INPUT');
    schema = removeReferenceInSchema(schema, 'email', 'OWASP-INPUT');

    const emailField = schema.fields.find(f => f.name === 'email');
    const usernameField = schema.fields.find(f => f.name === 'username');

    expect(emailField.refs).toHaveLength(0);
    expect(usernameField.refs).toHaveLength(1);
    expect(usernameField.refs[0].id).toBe('OWASP-INPUT');
  });

  it('schema is not mutated across operations', () => {
    const original = JSON.stringify(baseSchema);
    addReferenceInSchema(baseSchema, 'email', 'RFC5322');
    expect(JSON.stringify(baseSchema)).toBe(original);
  });
});
