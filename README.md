# formflow-cli

> A command-line tool to scaffold and validate web form schemas from JSON config files.

---

## Installation

```bash
npm install -g formflow-cli
```

---

## Usage

Create a JSON config file that defines your form structure, then run `formflow` to scaffold or validate it.

**Example config (`form.config.json`):**

```json
{
  "formId": "contact-form",
  "fields": [
    { "name": "email", "type": "email", "required": true },
    { "name": "message", "type": "textarea", "maxLength": 500 }
  ]
}
```

**Scaffold a new form:**

```bash
formflow scaffold --config form.config.json --output ./src/forms
```

**Validate an existing schema:**

```bash
formflow validate --config form.config.json
```

**Available commands:**

| Command    | Description                              |
|------------|------------------------------------------|
| `scaffold` | Generate form files from a JSON config   |
| `validate` | Check a JSON config for schema errors    |
| `init`     | Create a starter `form.config.json` file |

---

## Options

```
-c, --config <path>    Path to JSON config file
-o, --output <path>    Output directory for scaffolded files
-v, --version          Show version number
-h, --help             Show help
```

---

## License

MIT © formflow-cli contributors