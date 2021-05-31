# Pia

![CI](https://github.com/atnos/pia/workflows/integration-tests/badge.svg?branch=master)

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.1.

## Package Version

@angular-devkit/architect 0.1100.1
@angular-devkit/build-angular 0.1100.1
@angular-devkit/core 11.0.1
@angular-devkit/schematics 11.0.1
@angular/cli 11.0.1
@schematics/angular 11.0.1
@schematics/update 0.1100.1
rxjs 6.6.3
typescript 4.0.5

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
