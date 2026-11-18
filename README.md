# PIA Software

## Introduction

<img src="https://raw.githubusercontent.com/LINCnil/pia/master/src/assets/images/pia-auth-logo.png" align="left" hspace="10" vspace="6"> The PIA software is a free tool published by the [CNIL](https://www.cnil.fr/en/open-source-pia-software-helps-carry-out-data-protection-impact-assesment) which aims to help data controllers build and demonstrate compliance to the GDPR.

The latest version of the tool can be downloaded in the [Release](https://github.com/LINCnil/pia/releases) section of this repository.

## Translating the PIA Software

To translate the software, we invite you to make your changes [here](https://github.com/LINCnil/pia/tree/master/src/assets/i18n) where the translation steps are described.

# Development information

[![CI](https://github.com/LINCnil/pia/actions/workflows/integration-tests.yml/badge.svg?branch=master)](https://github.com/LINCnil/pia/actions/workflows/integration-tests.yml)
[![CodeQL](https://github.com/LINCnil/pia/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/LINCnil/pia/actions/workflows/codeql-analysis.yml)

This project was generated with [Angular CLI](https://github.com/angular/angular-cli).

## Package Version

See the [package.json](https://github.com/LINCnil/pia/blob/master/package.json#L40) file

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Package the application for Mac, Windows or GNU/Linux

### Mac:

You must set the ENV variables `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD` and `APPLE_TEAM_ID` inside a `.env` file at the root of the project.

```
yarn electron:mac
```

### Windows:

```
CSC_LINK=../path_to_your/file.pfx CSC_KEY_PASSWORD="Your PFX file password" yarn electron:win
```

### GNU/Linux:

Build AppImages and `.tar.gz` archives for x86-64 and ARM64:

```
yarn electron:linux
```

For a Snap build, run `yarn electron:snap` on the target architecture with
Snapcraft 8.x installed. To build all ARM64 formats on Ubuntu 22.04 ARM64,
run `SNAP_DESTRUCTIVE_MODE=true yarn electron:linux:arm64`. Snapcraft builds
directly on the host in this mode; use a dedicated VM or CI runner.

## Publish the application to Github

See: https://www.electron.build/configuration/publish

```
GH_TOKEN=YOUR_GITHUB_TOKEN yarn electron:publish-to-github
```

## PIA export & import .json format

If you need any guidance about the PIA .json file and its structure, check the dedicated [documentation here](https://github.com/LINCnil/pia/tree/master/docs/import-export-json-format.md)
