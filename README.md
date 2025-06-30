# grunt-translation-tasks

Grunt tasks for managing translations and internationalization in PHP projects using standard gettext tools.

## Features

- **makepot** (`xgettext`): Extracts translatable strings from PHP files into POT template
- **msgmerge**: Updates existing PO files with new strings from POT file  
- **makemo** (`msgfmt`): Compiles PO files to binary MO files
- **i18n**: Complete workflow - extract, merge, and compile translations

## Installation

1. Clone this repository into your project's dev folder:
   ```bash
   git submodule add https://github.com/magicoli/grunt-translation-tasks dev/grunt-translation-tasks
   ```

2. Add workspace configuration to your project's package.json:
   ```json
   "workspaces": {
     "packages": [
       "dev/grunt-translation-tasks"
     ]
   }
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Load the tasks in your Gruntfile.js:
   ```javascript
   // Load translation tasks
   require('./dev/grunt-translation-tasks/grunt-translation-tasks.js')(grunt);
   ```

## Usage

### Available Tasks

- `grunt makepot` - Extract strings to POT file
- `grunt msgmerge` - Update PO files with new POT content
- `grunt makemo` - Compile PO files to MO files
- `grunt i18n` - Run complete translation workflow

### Directory Structure

Uses standard gettext directory structure:
```
locale/
├── project-name.pot          # Template file
├── fr_FR/
│   └── LC_MESSAGES/
│       ├── project-name.po   # French translations
│       └── project-name.mo   # Compiled binary
├── nl_NL/
│   └── LC_MESSAGES/
│       ├── project-name.po   # Dutch translations
│       └── project-name.mo   # Compiled binary
└── ...
```

### Supported Translation Functions

Extracts strings from these PHP functions:
- `_()`, `__()` - Basic translation
- `_e()` - Echo translation
- `_c()`, `_x()`, `_ex()` - Context translation
- `_n()`, `_nx()` - Plural translation
- `esc_attr__()`, `esc_html__()` - Escaped translation
- `esc_attr_e()`, `esc_html_e()` - Escaped echo translation

## Requirements

- Node.js >= 14.0.0
- Grunt CLI
- Standard gettext tools (`xgettext`, `msgmerge`, `msgfmt`)

## Configuration

The project name is automatically detected from your `package.json`. You can customize paths and options by modifying the task configuration in your Gruntfile.js after loading the tasks.
