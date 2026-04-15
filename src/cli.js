#!/usr/bin/env node

const { program } = require('commander');
const { runExport } = require('./commands/export');
const { resolveInputPath: validateInput, runValidate } = require('./commands/validate');
const { buildSchemaConfig, runScaffold } = require('./commands/scaffold');
const { printDiff, runDiff } = require('./commands/diff');
const { runMerge } = require('./commands/merge');
const { runLint } = require('./commands/lint');
const pkg = require('../package.json');

program
  .name('formflow')
  .description('Scaffold and validate web form schemas from JSON config files')
  .version(pkg.version || '0.1.0');

program
  .command('validate <input>')
  .description('Validate a form schema JSON file')
  .action((input) => runValidate(input));

program
  .command('scaffold <output>')
  .description('Scaffold a new form schema JSON file')
  .option('-n, --name <name>', 'Schema name', 'MyForm')
  .option('-f, --fields <fields>', 'Comma-separated field ids', 'field1,field2')
  .action((output, opts) => runScaffold(output, opts));

program
  .command('export <input>')
  .description('Export a form schema to HTML, Markdown, or JSON')
  .option('-f, --format <format>', 'Output format: json | html | markdown', 'json')
  .option('-o, --output <path>', 'Output file path')
  .action((input, opts) => runExport(input, opts));

program
  .command('diff <schemaA> <schemaB>')
  .description('Show differences between two form schemas')
  .action((a, b) => runDiff(a, b));

program
  .command('merge <schemaA> <schemaB>')
  .description('Merge two form schemas')
  .option('-o, --output <path>', 'Output file path')
  .action((a, b, opts) => runMerge(a, b, opts));

program
  .command('lint <input>')
  .description('Lint a form schema for style and best-practice issues')
  .option('-s, --strict', 'Exit with error code if warnings are found')
  .option('-f, --format <format>', 'Output format: text | json', 'text')
  .action((input, opts) => runLint(input, opts));

program.parseAsync(process.argv);
