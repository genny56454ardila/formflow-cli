/**
 * review.js — CLI command handler for schema field reviews
 */

const path = require('path');
const fs = require('fs');
const { loadSchema } = require('../schema/loader');
const {
  reviewFieldInSchema,
  removeReviewInSchema,
  listReviews,
  getSummary
} = require('../schema/reviewer');

function resolveInputPath(inputArg) {
  return path.resolve(process.cwd(), inputArg);
}

async function runReview(action, inputArg, options = {}) {
  const inputPath = resolveInputPath(inputArg);
  const schema = await loadSchema(inputPath);

  let result;

  if (action === 'add') {
    const { field, reviewer, comment, status = 'pending' } = options;
    if (!field || !reviewer || !comment) {
      throw new Error('--field, --reviewer, and --comment are required for add action');
    }
    result = reviewFieldInSchema(schema, field, reviewer, comment, status);
    const outPath = options.output ? resolveInputPath(options.output) : inputPath;
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log(`Review added to field "${field}" by "${reviewer}".`);
    return result;
  }

  if (action === 'remove') {
    const { field, reviewer } = options;
    if (!field || !reviewer) {
      throw new Error('--field and --reviewer are required for remove action');
    }
    result = removeReviewInSchema(schema, field, reviewer);
    const outPath = options.output ? resolveInputPath(options.output) : inputPath;
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log(`Review by "${reviewer}" removed from field "${field}".`);
    return result;
  }

  if (action === 'list') {
    const reviews = listReviews(schema);
    const entries = Object.entries(reviews);
    if (entries.length === 0) {
      console.log('No reviews found.');
    } else {
      for (const [fieldName, revs] of entries) {
        console.log(`\n${fieldName}:`);
        for (const r of revs) {
          console.log(`  [${r.status}] ${r.reviewer}: ${r.comment}`);
        }
      }
    }
    return reviews;
  }

  if (action === 'summary') {
    const summary = getSummary(schema);
    console.log(`Total reviews : ${summary.total}`);
    console.log(`  approved    : ${summary.approved}`);
    console.log(`  pending     : ${summary.pending}`);
    console.log(`  rejected    : ${summary.rejected}`);
    console.log(`  needs-work  : ${summary['needs-work']}`);
    return summary;
  }

  throw new Error(`Unknown action: ${action}. Use add, remove, list, or summary.`);
}

module.exports = { resolveInputPath, runReview };
