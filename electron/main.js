const { app, BrowserWindow, Menu, shell } = require("electron/main");
const { setupAutoUpdater } = require("./updater");
const path = require("path");

const createWindow = () => {
  const win = new BrowserWindow({
    title: "PIA",
    width: 1281,
    height: 800,
    minWidth: 1281,
    minHeight: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  const menu = Menu.getApplicationMenu();
  menu.items.find(item => item.role === "help").visible = false;
  Menu.setApplicationMenu(menu);

  // win.webContents.openDevTools();
  win.loadFile(
    path.join(__dirname, "../dist", "pia-angular", "browser", "index.html")
  );

  const isExternal = url => /^https?:\/\//i.test(url);

  // Open external links (e.g. links added in a question/measure content)
  // in the default browser instead of navigating away inside the app window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isExternal(url)) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (isExternal(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
};

app.whenReady().then(() => {
  createWindow();
  setupAutoUpdater();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
