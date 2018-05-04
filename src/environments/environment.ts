// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  name: 'development',
  production: false,
  version: 'DEV',
  rollbar_key: '',
  date_format: 'DD MM YY HH:mm:ss',
  api: {
    client_id:     '4_3w5oauyhyosggw00kwggc444s4wwk0o4sgg0k4c4wks8kg0cc0',
    client_secret: '25jw4beivse88soc84os0o44ssgc0gsgcoosgokw0kwkkokckg',
    host:          'http://localhost:8000',
    token_path:    '/oauth/v2/token'
  },
};
