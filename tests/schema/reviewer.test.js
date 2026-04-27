const {
  addReview,
  removeReview,
  getReviews,
  reviewFieldInSchema,
  removeReviewInSchema,
  listReviews,
  getSummary
} = require('../../src/schema/reviewer');

const baseField = { name: 'email', type: 'text' };
const baseSchema = {
  name: 'contact',
  fields: [
    { name: 'email', type: 'text' },
    { name: 'phone', type: 'text' }
  ]
};

describe('addReview', () => {
  it('adds a review to a field with no prior reviews', () => {
    const result = addReview(baseField, 'alice', 'Looks good', 'approved');
    expect(result.reviews).toHaveLength(1);
    expect(result.reviews[0].reviewer).toBe('alice');
    expect(result.reviews[0].status).toBe('approved');
  });

  it('appends review to existing reviews', () => {
    const field = addReview(baseField, 'alice', 'First look', 'pending');
    const result = addReview(field, 'bob', 'Second look', 'approved');
    expect(result.reviews).toHaveLength(2);
  });

  it('defaults status to pending', () => {
    const result = addReview(baseField, 'alice', 'Check this');
    expect(result.reviews[0].status).toBe('pending');
  });

  it('throws on invalid status', () => {
    expect(() => addReview(baseField, 'alice', 'bad', 'maybe')).toThrow('Invalid review status');
  });

  it('does not mutate original field', () => {
    addReview(baseField, 'alice', 'ok', 'approved');
    expect(baseField.reviews).toBeUndefined();
  });
});

describe('removeReview', () => {
  it('removes a review by reviewer name', () => {
    const field = addReview(baseField, 'alice', 'ok', 'approved');
    const result = removeReview(field, 'alice');
    expect(result.reviews).toBeUndefined();
  });

  it('returns field unchanged if no reviews', () => {
    const result = removeReview(baseField, 'alice');
    expect(result).toEqual(baseField);
  });
});

describe('getReviews', () => {
  it('returns empty array for field with no reviews', () => {
    expect(getReviews(baseField)).toEqual([]);
  });

  it('returns reviews array', () => {
    const field = addReview(baseField, 'alice', 'ok', 'approved');
    expect(getReviews(field)).toHaveLength(1);
  });
});

describe('reviewFieldInSchema', () => {
  it('adds review to named field in schema', () => {
    const result = reviewFieldInSchema(baseSchema, 'email', 'alice', 'ok', 'approved');
    const emailField = result.fields.find(f => f.name === 'email');
    expect(emailField.reviews).toHaveLength(1);
  });

  it('leaves other fields unchanged', () => {
    const result = reviewFieldInSchema(baseSchema, 'email', 'alice', 'ok', 'approved');
    const phoneField = result.fields.find(f => f.name === 'phone');
    expect(phoneField.reviews).toBeUndefined();
  });
});

describe('listReviews', () => {
  it('returns map of field names to reviews', () => {
    const schema = reviewFieldInSchema(baseSchema, 'email', 'alice', 'ok', 'approved');
    const result = listReviews(schema);
    expect(result).toHaveProperty('email');
    expect(result).not.toHaveProperty('phone');
  });
});

describe('getSummary', () => {
  it('returns counts by status', () => {
    let schema = reviewFieldInSchema(baseSchema, 'email', 'alice', 'ok', 'approved');
    schema = reviewFieldInSchema(schema, 'phone', 'bob', 'check', 'pending');
    const summary = getSummary(schema);
    expect(summary.total).toBe(2);
    expect(summary.approved).toBe(1);
    expect(summary.pending).toBe(1);
  });
});
