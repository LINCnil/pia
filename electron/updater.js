const { autoUpdater } = require("electron-updater");
const { dialog } = require("electron");

function setupAutoUpdater() {
  // Configure autoUpdater - disable automatic download and install
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  // Update events
  autoUpdater.on("checking-for-update", () => {
    console.log("Checking for updates...");
  });

  autoUpdater.on("update-available", info => {
    console.log("Update available:", info);
    dialog
      .showMessageBox({
        type: "info",
        title: "Update Available",
        message: `Version ${info.version} is available. Would you like to download it?`,
        buttons: ["Download", "Cancel"]
      })
      .then(result => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
  });

  autoUpdater.on("update-not-available", () => {
    console.log("No updates available");
  });

  autoUpdater.on("download-progress", progress => {
    console.log(`Download progress: ${progress.percent.toFixed(2)}%`);
  });

  autoUpdater.on("update-downloaded", info => {
    console.log("Update downloaded", info);
    dialog
      .showMessageBox({
        type: "info",
        title: "Update Ready",
        message: "Update downloaded. Would you like to install it now?",
        buttons: ["Install Now", "Later"]
      })
      .then(result => {
        if (result.response === 0) autoUpdater.quitAndInstall();
      });
  });

  autoUpdater.on("error", err => {
    console.error("AutoUpdater error:", err);
  });

  // Check for updates
  autoUpdater.checkForUpdates();
}

module.exports = {
  setupAutoUpdater
};
