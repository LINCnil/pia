const { dialog, BrowserWindow } = require("electron");
const { autoUpdater } = require("electron-updater");

const path = require("path");
const url = require("url");

autoUpdater.logger = require("electron-log");
autoUpdater.logger.transports.file.level = "info";

autoUpdater.autoDownload = false;

// All in one command
// autoUpdater.checkForUpdatesAndNotify()

exports.check = () => {
  let progressWin = new BrowserWindow({
    width: 350,
    height: 35,
    useContentSize: true,
    autoHideMenuBar: true,
    maximizable: false,
    fullscreen: false,
    fullscreenable: false,
    resizable: false,
    show: false,
    modal: true
  });

  autoUpdater
    .checkForUpdates()
    .then(response => {
      autoUpdater.logger.info(response);
    })
    .catch(err => {
      autoUpdater.logger.warn(err);
    });

  autoUpdater.on("update-available", () => {
    dialog
      .showMessageBox({
        type: "info",
        title: "Update Available",
        message:
          "A new version of PIA is available. Do you want to update now?",
        buttons: ["Update", "No"]
      })
      .then(result => {
        if (result.response !== 0) return;
        autoUpdater.logger.info("----->>>>> USER WANT TO UPDATE APP");
        autoUpdater
          .downloadUpdate()
          .then(response => {
            autoUpdater.logger.info(response);
          })
          .catch(err => {
            autoUpdater.logger.warn(err);
          });

        progressWin.loadURL(
          url.format({
            pathname: path.join(__dirname, "renderer", "progress.html"),
            protocol: "file:",
            slashes: true
          })
        );

        progressWin.once("ready-to-show", () => {
          progressWin.show();
        });

        progressWin.on("closed", () => {
          progressWin = null;
        });
      })
      .catch(err => {
        console.log(err);
      });
  });

  autoUpdater.on("update-downloaded", () => {
    if (progressWin) progressWin.close();
    dialog
      .showMessageBox({
        type: "info",
        title: "Update ready",
        message: "A new version of PIA is ready. Quit and install now?",
        buttons: ["Yes", "Later"]
      })
      .then(result => {
        if (result.response === 0) autoUpdater.quitAndInstall();
      })
      .catch(err => {
        console.log(err);
      });
  });
};
