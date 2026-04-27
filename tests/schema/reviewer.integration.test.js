/**
 * Integration tests: reviewer round-trip through add → list → remove
 */

const {
  addReview,
  removeReview,
  reviewFieldInSchema,
  removeReviewInSchema,
  listReviews,
  getSummary
} = require('../../src/schema/reviewer');

const baseSchema = {
  name: 'registration',
  fields: [
    { name: 'username', type: 'text' },
    { name: 'password', type: 'password' },
    { name: 'email', type: 'email' }
  ]
};

describe('reviewer integration', () => {
  it('full review lifecycle: add, list, summary, remove', () => {
    let schema = reviewFieldInSchema(baseSchema, 'username', 'alice', 'Username looks fine', 'approved');
    schema = reviewFieldInSchema(schema, 'password', 'bob', 'Needs strength indicator', 'needs-work');
    schema = reviewFieldInSchema(schema, 'email', 'alice', 'Validate format', 'pending');

    const reviews = listReviews(schema);
    expect(Object.keys(reviews)).toHaveLength(3);
    expect(reviews['username'][0].status).toBe('approved');
    expect(reviews['password'][0].status).toBe('needs-work');

    const summary = getSummary(schema);
    expect(summary.total).toBe(3);
    expect(summary.approved).toBe(1);
    expect(summary['needs-work']).toBe(1);
    expect(summary.pending).toBe(1);

    schema = removeReviewInSchema(schema, 'password', 'bob');
    const afterRemove = listReviews(schema);
    expect(afterRemove).not.toHaveProperty('password');

    const finalSummary = getSummary(schema);
    expect(finalSummary.total).toBe(2);
  });

  it('multiple reviewers on same field', () => {
    let field = { name: 'email', type: 'email' };
    field = addReview(field, 'alice', 'Check format', 'pending');
    field = addReview(field, 'bob', 'Approved by me', 'approved');
    field = addReview(field, 'carol', 'Needs rework', 'needs-work');

    expect(field.reviews).toHaveLength(3);

    field = removeReview(field, 'bob');
    expect(field.reviews).toHaveLength(2);
    expect(field.reviews.find(r => r.reviewer === 'bob')).toBeUndefined();
  });
});
