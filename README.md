<img height="204" src="https://cloud.githubusercontent.com/assets/464822/20228152/d3f36dc2-a804-11e6-80ff-51ada2d13ea7.png">

# [Blueprint](http://blueprintjs.com/) [![CircleCI](https://circleci.com/gh/palantir/blueprint/tree/develop.svg?style=svg)](https://circleci.com/gh/palantir/workflows/blueprint)

Blueprint is a React-based UI toolkit for the web.

It is optimized for building complex, data-dense web interfaces for _desktop applications_ which run in modern browsers.
This is not a mobile-first UI toolkit.

[**Read the introductory blog post ▸**](https://medium.com/@palantir/scaling-product-design-with-blueprint-25492827bb4a)

[**View the full documentation ▸**](http://blueprintjs.com/docs)

[**Try it out on CodeSandbox ▸**](https://codesandbox.io/p/sandbox/blueprint-v5-x-sandbox-react-16-wy0ojy)

[**Read frequently asked questions (FAQ) on the wiki ▸**](https://github.com/palantir/blueprint/wiki/Frequently-Asked-Questions)

## Changelog

Blueprint's change log and migration guides for major versions live on the repo's
[Github wiki](https://github.com/palantir/blueprint/wiki/5.x-Changelog).

## Packages

This repository contains multiple projects in the `packages/` directory that fall into 3 categories:

### Libraries

These are the component libraries we publish to NPM.

-   [![npm](https://img.shields.io/npm/v/@blueprintjs/colors.svg?label=@blueprintjs/colors)](https://www.npmjs.com/package/@blueprintjs/colors) &ndash; Design system color variables.
-   [![npm](https://img.shields.io/npm/v/@blueprintjs/core.svg?label=@blueprintjs/core)](https://www.npmjs.com/package/@blueprintjs/core) &ndash; Core styles & components.
-   [![npm](https://img.shields.io/npm/v/@blueprintjs/datetime.svg?label=@blueprintjs/datetime)](https://www.npmjs.com/package/@blueprintjs/datetime) &ndash; Components for interacting with dates and times.
-   [![npm](https://img.shields.io/npm/v/@blueprintjs/datetime2.svg?label=@blueprintjs/datetime2)](https://www.npmjs.com/package/@blueprintjs/datetime2) &ndash; Next-generation components for interacting with dates and times.
-   [![npm](https://img.shields.io/npm/v/@blueprintjs/icons.svg?label=@blueprintjs/icons)](https://www.npmjs.com/package/@blueprintjs/icons) &ndash; APIs for displaying icons (contains both SVG and icon font implementations).
-   [![npm](https://img.shields.io/npm/v/@blueprintjs/monaco-editor-theme.svg?label=@blueprintjs/monaco-editor-theme)](https://www.npmjs.com/package/@blueprintjs/monaco-editor-theme) &ndash; Theme for [Monaco Editor](https://microsoft.github.io/monaco-editor/) (:warning: experimental).
-   [![npm](https://img.shields.io/npm/v/@blueprintjs/select.svg?label=@blueprintjs/select)](https://www.npmjs.com/package/@blueprintjs/select) &ndash; Components for selecting items from a list.
-   [![npm](https://img.shields.io/npm/v/@blueprintjs/table.svg?label=@blueprintjs/table)](https://www.npmjs.com/package/@blueprintjs/table) &ndash; Scalable & interactive spreadsheet-like table component.

### Applications

These are hosted on GitHub Pages as static web applications:

-   `docs-app` &ndash; Documentation site at blueprintjs.com/docs
-   `landing-app` &ndash; Landing page at blueprintjs.com

These are used as development playground environments:

-   `demo-app` &ndash; demo page that shows many components all on the same page in light and dark themes
-   `table-dev-app` &ndash; demo page that supports manual testing of all table features

### Build tooling

These packages define development dependencies and contain build configuration. They adhere to the standard NPM package layout, which allows us to keep clear API boundaries for build configuration and isolate groups of `devDependencies`. They are published to NPM in order to allow other Blueprint-related projects to use this infrastructure outside this monorepo.

-   [![npm](https://img.shields.io/npm/v/@blueprintjs/docs-theme.svg?label=@blueprintjs/docs-theme)](https://www.npmjs.com/package/@blueprintjs/docs-theme) &ndash; Documentation theme for [Documentalist](https://github.com/palantir/documentalist) data.
-   [![npm](https://img.shields.io/npm/v/@blueprintjs/eslint-config.svg?label=@blueprintjs/eslint-config)](https://www.npmjs.com/package/@blueprintjs/eslint-config) &ndash; ESLint configuration used in this repo and recommended for Blueprint-related projects.
-   [![npm](https://img.shields.io/npm/v/@blueprintjs/eslint-plugin.svg?label=@blueprintjs/eslint-plugin)](https://www.npmjs.com/package/@blueprintjs/eslint-plugin) &ndash; implementations for custom ESLint rules which enforce best practices for Blueprint usage.
-   [![npm](https://img.shields.io/npm/v/@blueprintjs/karma-build-scripts.svg?label=@blueprintjs/karma-build-scripts)](https://www.npmjs.com/package/@blueprintjs/karma-build-scripts) &ndash; Karma test runner configuration.
-   [![npm](https://img.shields.io/npm/v/@blueprintjs/node-build-scripts.svg?label=@blueprintjs/node-build-scripts)](https://www.npmjs.com/package/@blueprintjs/node-build-scripts) &ndash; various utility scripts for building Sass sources, linting Sass & TypeScript, generating Sass & Less variables, and optimizing icon SVGs.
-   [![npm](https://img.shields.io/npm/v/@blueprintjs/stylelint-plugin.svg?label=@blueprintjs/stylelint-plugin)](https://www.npmjs.com/package/@blueprintjs/stylelint-plugin) &ndash; implementations for custom stylelint rules which enforce best practices for Blueprint usage.
-   [![npm](https://img.shields.io/npm/v/@blueprintjs/test-commons.svg?label=@blueprintjs/test-commons)](https://www.npmjs.com/package/@blueprintjs/test-commons) &ndash; various utility functions used in Blueprint test suites.
-   [![npm](https://img.shields.io/npm/v/@blueprintjs/tslint-config.svg?label=@blueprintjs/tslint-config)](https://www.npmjs.com/package/@blueprintjs/tslint-config) &ndash; TSLint configuration used in this repo and recommended for Blueprint-related projects (should be installed by `@blueprintjs/eslint-config`, not directly).
-   [![npm](https://img.shields.io/npm/v/@blueprintjs/webpack-build-scripts.svg?label=@blueprintjs/webpack-build-scripts)](https://www.npmjs.com/package/@blueprintjs/webpack-build-scripts) &ndash; Webpack build configuration for Blueprint projects.

## Contributing

Looking for places to contribute to the codebase?
First read the [contribution guidelines](https://github.com/palantir/blueprint/blob/develop/CONTRIBUTING.md),
then [check out the "help wanted" label](https://github.com/palantir/blueprint/labels/help%20wanted).

## Development

[Yarn](https://yarnpkg.com/) manages third-party and inter-package dependencies in this monorepo.
Builds are orchestrated via [Nx's task runner](https://nx.dev/getting-started/intro) and NPM scripts.
[Lerna-Lite](https://github.com/lerna-lite/lerna-lite) is used to prepare releases.

**Prerequisites**: Node.js v20.11+ (see version specified in `.nvmrc`), Yarn v4.x (see version specified in `package.json`)

### One-time setup

First, ensure you have `nvm` ([Node Version Manager](https://github.com/nvm-sh/nvm)) installed.

After cloning this repo, run:

1. `nvm use` to use the supported Node version for Blueprint development.
2. `corepack enable` to activate [Yarn](https://yarnpkg.com/getting-started) as the Node package manager.
3. `yarn` to install all dependencies for the monorepo.
    1. If seeing an error like "Error when performing the request ...", you may be using a VPN that needs to be disabled to install the dependencies.
4. If running on Windows:
    1. `npm install -g windows-build-tools` to install build tools globally
    2. Ensure `bash` is your configured script-shell by running:<br />
       `npm config set script-shell "C:\\Program Files\\git\\bin\\bash.exe"`<br />
	   (reset this by running `npm config delete script-shell`)
5. `yarn verify` to ensure you have all the build tooling working properly.
    1. There may currently be some errors when running this step, even though everything is set up properly, see https://github.com/palantir/blueprint/issues/6926 for more info.

### Incorporating upstream changes

If you were previously in a working state and have just pulled new code from `develop`:

-   If there were package dependency changes, run `yarn` at the root.
    -   This command is very quick if there are no new things to install.
-   Run `yarn compile` to get the latest built versions of the library packages in this repo.
    -   This command is quicker than `yarn verify` since it doesn't build the application packages (`docs-app`,`landing-app`, etc.) or run tests

### Developing libraries

There are a few ways to run development scripts, here they are listed from simplest to more advanced usage:

-   Run `yarn dev` from the root directory to watch changes across all packages and run the docs application with webpack-dev-server.
-   Alternately, most libraries have a dev script to run the docs app _and_ watch changes to only that package:
    -   `yarn dev:core`
    -   `yarn dev:docs`
    -   `yarn dev:datetime`
    -   `yarn dev:select`
    -   `yarn dev:table`
-   Lastly, if you want to control exactly which dev scripts are run and view the console output in the cleanest way, we recommend opening separate terminal windows or splits and running local package dev tasks in each one. This is the recommended workflow for frequent contributors and advanced developers. For example, to test changes in the core and icons packages, you would run the following in separate terminals:
    -   `cd packages/core && yarn dev`
    -   `cd packages/icons && yarn dev`
    -   `cd packages/docs-app && yarn dev`

### Updating documentation

Much of Blueprint's documentation lives inside source code as JSDoc comments in `.tsx` files and KSS markup in `.scss` files. This documentation is extracted and converted into static JSON data using [documentalist](https://github.com/palantir/documentalist/). If you are updating documentation sources (_not_ the docs UI code which lives in `packages/docs-app` or the docs theme in `packages/docs-theme`), you'll need to run `yarn compile` from `packages/docs-data` to see changes reflected in the application. For simplicity, an alias script `yarn docs-data` exists in the root to minimize directory hopping.

### Updating icons

The [One-time setup](#one-time-setup) and [Incorporating upstream changes](#incorporating-upstream-changes) steps should produce the generated source code in this repo used to build the icons documentation. This is sufficient for most development workflows.

If you are updating icons or adding new ones, you'll need to run `yarn compile` in `packages/icons` to see those changes reflected before running any of the dev scripts.

## License

This project is made available under the Apache 2.0 License.
