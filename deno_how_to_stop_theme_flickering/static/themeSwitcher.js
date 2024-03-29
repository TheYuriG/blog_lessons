const selectedTheme = localStorage.getItem("theme");
if (selectedTheme === null) {
  window.showDarkMode =
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  localStorage.setItem("theme", window.showDarkMode ? "Dark" : "Light");
} else {
  window.showDarkMode = selectedTheme === "Dark";
}
const cssRoot = document.querySelector(":root");
if (window.showDarkMode === true) {
  cssRoot.style.setProperty("--base-color", "rgb(15 23 42)");
  cssRoot.style.setProperty("--neutral-color", "rgb(203 213 225)");
  cssRoot.style.setProperty("--accent-color", "rgb(126 34 206)");
} else {
  cssRoot.style.setProperty("--base-color", "rgb(203 213 225)");
  cssRoot.style.setProperty("--neutral-color", "rgb(15 23 42)");
  cssRoot.style.setProperty("--accent-color", "rgb(220 38 38)");
}
