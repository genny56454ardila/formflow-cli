#!/usr/bin/env node
/**
 * cli.js — Entry point for formflow-cli
 */

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const { runExport } = require('./commands/export');
const { runSort } = require('./commands/sort');

yargs(hideBin(process.argv))
  .scriptName('formflow')
  .usage('$0 <command> [options]')

  .command(
    'validate <input>',
    'Validate a form schema JSON file',
    (yargs) => yargs.positional('input', { describe: 'Path to schema file', type: 'string' }),
    (argv) => require('./commands/validate').resolveInputPath(argv.input)
  )

  .command(
    'scaffold',
    'Scaffold a new form schema',
    (yargs) => yargs
      .option('name', { type: 'string', demandOption: true, describe: 'Schema name' })
      .option('fields', { type: 'string', describe: 'Comma-separated field names' }),
    (argv) => require('./commands/scaffold').buildSchemaConfig(argv)
  )

  .command(
    'export <input>',
    'Export a schema to JSON, HTML, or Markdown',
    (yargs) => yargs
      .positional('input', { describe: 'Path to schema file', type: 'string' })
      .option('format', { type: 'string', default: 'json', describe: 'Output format: json|html|md' })
      .option('output', { type: 'string', describe: 'Output file path' }),
    (argv) => runExport(argv)
  )

  .command(
    'diff <a> <b>',
    'Diff two schema files',
    (yargs) => yargs
      .positional('a', { type: 'string' })
      .positional('b', { type: 'string' }),
    (argv) => require('./commands/diff').printDiff(argv)
  )

  .command(
    'merge <base> <other>',
    'Merge two schema files',
    (yargs) => yargs
      .positional('base', { type: 'string' })
      .positional('other', { type: 'string' })
      .option('output', { type: 'string', describe: 'Output file path' }),
    (argv) => require('./commands/merge').resolveInputPath(argv.base)
  )

  .command(
    'lint <input>',
    'Lint a schema file for style issues',
    (yargs) => yargs.positional('input', { type: 'string' }),
    (argv) => require('./commands/lint').resolveInputPath(argv.input)
  )

  .command(
    'snapshot <input>',
    'Save or compare a schema snapshot',
    (yargs) => yargs
      .positional('input', { type: 'string' })
      .option('name', { type: 'string', describe: 'Snapshot name' }),
    (argv) => require('./commands/snapshot').resolveInputPath(argv.input)
  )

  .command(
    'sort <input>',
    'Sort schema fields by a given key',
    (yargs) => yargs
      .positional('input', { describe: 'Path to schema file', type: 'string' })
      .option('key', { type: 'string', default: 'name', describe: 'Field to sort by: name|type|required|label' })
      .option('order', { type: 'string', default: 'asc', describe: 'Sort order: asc|desc' })
      .option('output', { type: 'string', describe: 'Output file path' }),
    (argv) => runSort(argv)
  )

  .demandCommand(1, 'Please specify a command.')
  .help()
  .argv;
