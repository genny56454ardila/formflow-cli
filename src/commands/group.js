const path = require('path');
const { loadSchema } = require('../schema/loader');
const { groupSchema, formatGroups } = require('../schema/grouper');

function resolveInputPath(inputArg) {
  if (!inputArg) throw new Error('Input path is required');
  return path.resolve(process.cwd(), inputArg);
}

async function runGroup(inputArg, options = {}) {
  const inputPath = resolveInputPath(inputArg);
  const schema = await loadSchema(inputPath);
  const groupBy = options.by || 'type';

  let result;
  try {
    result = groupSchema(schema, groupBy);
  } catch (err) {
    console.error(`Error grouping schema: ${err.message}`);
    process.exit(1);
  }

  if (options.json) {
    console.log(JSON.stringify(result.groups, null, 2));
    return result.groups;
  }

  const formatted = formatGroups(result.groups);
  console.log(`\nGrouped by "${groupBy}":\n`);
  console.log(formatted);
  console.log();
  return result.groups;
}

module.exports = { resolveInputPath, runGroup };
