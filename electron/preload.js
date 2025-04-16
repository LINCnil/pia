function checkAndReloadIfBlank() {
  if (document.body && document.body.innerHTML.trim() === "") {
    window.location.reload();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  // First check - immediately after DOM content loaded
  setTimeout(checkAndReloadIfBlank, 100);

  // Second check - give Angular a bit more time to render
  setTimeout(checkAndReloadIfBlank, 500);
});

window.addEventListener("load", () => {
  setTimeout(checkAndReloadIfBlank, 1000);
});

window.forceReload = () => {
  window.location.reload();
};
