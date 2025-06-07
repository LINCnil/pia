const { app, BrowserWindow, Menu } = require("electron/main");
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
};

app.whenReady().then(createWindow);

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
