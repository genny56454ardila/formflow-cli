const path = require('path');
const chalk = require('chalk');
const { diffSchemaFiles } = require('../schema/differ');

/**
 * Resolve an input path relative to cwd if not absolute
 * @param {string} inputPath
 * @returns {string}
 */
function resolveInputPath(inputPath) {
  return path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(process.cwd(), inputPath);
}

/**
 * Format and print a diff report to stdout
 * @param {Object} diff
 */
function printDiff(diff) {
  if (!diff.hasChanges) {
    console.log(chalk.green('✔ No differences found between schemas.'));
    return;
  }

  if (diff.added.length > 0) {
    console.log(chalk.bold.green('\n+ Added fields:'));
    for (const field of diff.added) {
      console.log(chalk.green(`  + ${field.name} (${field.type})`));
    }
  }

  if (diff.removed.length > 0) {
    console.log(chalk.bold.red('\n- Removed fields:'));
    for (const field of diff.removed) {
      console.log(chalk.red(`  - ${field.name} (${field.type})`));
    }
  }

  if (diff.modified.length > 0) {
    console.log(chalk.bold.yellow('\n~ Modified fields:'));
    for (const mod of diff.modified) {
      console.log(chalk.yellow(`  ~ ${mod.name}:`));
      for (const [key, val] of Object.entries(mod.changes)) {
        console.log(chalk.red(`      ${key}: ${JSON.stringify(val.from)}`));
        console.log(chalk.green(`      ${key}: ${JSON.stringify(val.to)}`));
      }
    }
  }
}

/**
 * Run the diff command
 * @param {string} fileA
 * @param {string} fileB
 * @param {Object} options
 */
async function runDiff(fileA, fileB, options = {}) {
  const pathA = resolveInputPath(fileA);
  const pathB = resolveInputPath(fileB);

  try {
    const diff = await diffSchemaFiles(pathA, pathB);
    printDiff(diff);
    if (options.exitCode && diff.hasChanges) {
      process.exit(1);
    }
  } catch (err) {
    console.error(chalk.red(`Error: ${err.message}`));
    process.exit(1);
  }
}

module.exports = { resolveInputPath, printDiff, runDiff };
