/**
 * reviewer.js — Add, remove, and list review notes on schema fields
 */

function addReview(field, reviewer, comment, status = 'pending') {
  const validStatuses = ['pending', 'approved', 'rejected', 'needs-work'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid review status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
  }
  const review = {
    reviewer,
    comment,
    status,
    timestamp: new Date().toISOString()
  };
  const reviews = field.reviews ? [...field.reviews, review] : [review];
  return { ...field, reviews };
}

function removeReview(field, reviewer) {
  if (!field.reviews) return field;
  const reviews = field.reviews.filter(r => r.reviewer !== reviewer);
  return { ...field, reviews: reviews.length ? reviews : undefined };
}

function getReviews(field) {
  return field.reviews || [];
}

function reviewFieldInSchema(schema, fieldName, reviewer, comment, status) {
  const fields = schema.fields.map(f =>
    f.name === fieldName ? addReview(f, reviewer, comment, status) : f
  );
  return { ...schema, fields };
}

function removeReviewInSchema(schema, fieldName, reviewer) {
  const fields = schema.fields.map(f =>
    f.name === fieldName ? removeReview(f, reviewer) : f
  );
  return { ...schema, fields };
}

function listReviews(schema) {
  const result = {};
  for (const field of schema.fields) {
    if (field.reviews && field.reviews.length > 0) {
      result[field.name] = field.reviews;
    }
  }
  return result;
}

function getSummary(schema) {
  const all = [];
  for (const field of schema.fields) {
    if (field.reviews) all.push(...field.reviews);
  }
  const counts = { pending: 0, approved: 0, rejected: 0, 'needs-work': 0 };
  for (const r of all) counts[r.status] = (counts[r.status] || 0) + 1;
  return { total: all.length, ...counts };
}

module.exports = {
  addReview,
  removeReview,
  getReviews,
  reviewFieldInSchema,
  removeReviewInSchema,
  listReviews,
  getSummary
};
