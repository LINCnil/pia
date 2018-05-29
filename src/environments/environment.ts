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
    client_id:     '1_49i8o287f8kk00840cg4ggkws0o0g44ocsogkc0w0g84o80co4',
    client_secret: '22zpxqpr0r40wo0g8kw00k4kccg0wwkso8ccc0ogsgwogcssss',
    host:          'http://localhost:8001',
    token_path:    '/oauth/v2/token'
  }
};
