// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyDq-NEBhmKmrmLNzRi6JQL1wQh_FRA_rf0',
    databaseURL: 'https://sanhei-bills-development.firebaseio.com',
    storageBucket: 'sanhei-bills-development.appspot.com',
    authDomain: 'sanhei-bills-development.firebaseapp.com',
    messagingSenderId: '1096089472440',
    projectId: 'sanhei-bills-development',
  },
}
