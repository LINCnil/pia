# Pia [v.3.2.2](https://github.com/LINCnil/pia/releases/tag/v3.2.2)

# Le logiciel PIA / The PIA Software

## Présentation / Presentation

<img src="https://raw.githubusercontent.com/LINCnil/pia/master/src/assets/images/pia-auth-logo.png" align="left" hspace="10" vspace="6"> Le logiciel PIA est un outil distribué librement par la [CNIL](https://www.cnil.fr/fr/outil-pia-telechargez-et-installez-le-logiciel-de-la-cnil) afin de faciliter la réalisation d’analyses d’impact sur la protection des données prévues par le RGPD.

La dernière version de l'outil est téléchargeable dans la section [Release](https://github.com/LINCnil/pia/releases) de ce dépôt.

The PIA software is a free tool published by the [CNIL](https://www.cnil.fr/en/open-source-pia-software-helps-carry-out-data-protection-impact-assesment) which aims to help data controllers build and demonstrate compliance to the GDPR.

The latest version of the tool can be downloaded in the [Release](https://github.com/LINCnil/pia/releases) section of this repository.

## Traduire le logiciel PIA / Translating the PIA Software

Pour traduire le logiciel, nous vous invitons à vous rendre dans le [dépôt dédié](https://github.com/LINCnil/pia-i18n/tree/main/src/lib/assets/i18n) dans lequel les étapes de traduction sont décrites.

To translate the software, we invite you to visit the [related repository](https://github.com/LINCnil/pia-i18n/tree/main/src/lib/assets/i18n) where the translation steps are described.

# Information de développement / Dev information

![CI](https://github.com/lincnil/pia/workflows/integration-tests/badge.svg?branch=master)
[![CodeQL](https://github.com/LINCnil/pia/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/LINCnil/pia/actions/workflows/codeql-analysis.yml)

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.10.

NodeJs version: 20.10.0

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

You must set the ENV variables `APPLEID` and `APPLEPIAPASSWORD` inside a `.env` file at the root of the project.

```
yarn electron:mac
```

### Windows:

```
CSC_LINK=../path_to_your/file.pfx CSC_KEY_PASSWORD="Your PFX file password" yarn electron:win
```

### GNU/Linux:

```
yarn electron:linux
```

## Publish the application to Github

See: https://www.electron.build/configuration/publish

```
GH_TOKEN=YOUR_GITHUB_TOKEN yarn electron:publish-to-github
```

## How to work on pia-i18n

You can work on this project with a [pia-i18n](https://github.com/LINCnil/pia-i18n) directly in development process.

This process permit to check your changes on the pia-i18n code (for traduction updates, fixes...) directly on the pia project

### /!\ Requirements /!\ :

- nodejs in lts version (14.17.4)
- ng client `npm install -g @angular/cli`

If you have to update your node version, you may to remove ./node_modules folder and type "npm i or yarn install" before continue.

### Set up your pia project

Get pia-i18n in the projects folder
Clone pia-i18n in a ./projects/pia-i18n folder

```
git clone git@github.com:LINCnil/pia-i18n.git ./projects/pia-i18n
```

Stop using npm dependency

- remove @atnos/pia-i18n dependency in package.json
- yarn

**warning** no commit this changes on the pia repository

build / rebuild the local

```
ng build pia-i18n --prod
```

start pia project

```
yarn start
```

This process replace npm @atnos/pia-i18n by the local pia-i18n dist folder
