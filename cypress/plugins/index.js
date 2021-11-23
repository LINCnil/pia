// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
require("dotenv").config();

module.exports = (on, config) => {
  // config = dotenvPlugin(config);

  on("before:browser:launch", (browser, launchOptions) => {
    const downloadDirectory = "../download";
    // CHROME
    if (browser.family === "chromium" && browser.name !== "electron") {
      launchOptions.preferences.default["download"] = {
        default_directory: downloadDirectory,
        prompt_for_download: false
      };

      launchOptions.preferences.default.intl = { accept_languages: "en" };
      return launchOptions;
    }

    // FIREFOX
    if (browser.family === "firefox") {
      launchOptions.preferences["browser.download.dir"] = downloadDirectory;
      launchOptions.preferences["browser.download.folderList"] = 0;
      launchOptions.preferences["browser.download.promptMaxAttempts"] = 0;
      launchOptions.preferences["browser.download.forbid_open_with"] = true;
      launchOptions.preferences["browser.download.manager.useWindow"] = false;
      launchOptions.preferences[
        "browser.download.manager.alertOnEXEOpen"
      ] = false;

      // needed to prevent download prompt for text/csv files.
      launchOptions.preferences["browser.helperApps.neverAsk.saveToDisk"] =
        "text/csv";

      return launchOptions;
    }
  });

  return Object.assign({}, config, {
    env: {
      URL: process.env.CYPRESS_PIA_BACK_URL,
      ID: process.env.CYPRESS_PIA_BACK_ID,
      SECRET: process.env.CYPRESS_PIA_BACK_SECRET
    }
  });
};
