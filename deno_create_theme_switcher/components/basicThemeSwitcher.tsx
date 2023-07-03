import { useEffect, useState } from "preact/hooks";
export default function ThemeSwitcher() {
  const [theme, setTheme] = useState("Dark");

  useEffect(() => {
    const cssRoot: HTMLElement | null = document.querySelector(":root");
    if (cssRoot !== null) {
      if (theme === "Light") {
        cssRoot.style.setProperty("--base-color", "rgb(203 213 225)");
        cssRoot.style.setProperty("--neutral-color", "rgb(15 23 42)");
        cssRoot.style.setProperty("--accent-color", "rgb(220 38 38)");
      } else {
        cssRoot.style.setProperty("--base-color", "rgb(15 23 42)");
        cssRoot.style.setProperty("--neutral-color", "rgb(203 213 225)");
        cssRoot.style.setProperty("--accent-color", "rgb(126 34 206)");
      }
    }
  }, [theme]);

  const themes: string[] = ["Dark", "Light"];

  return (
    <>
      {themes.map((themeOption) => (
        <label for={themeOption}>
          <input
            class="mr-1"
            type="radio"
            id={themeOption}
            name="theme"
            checked={theme == themeOption}
            onClick={() => {
              setTheme(themeOption);
            }}
          >
          </input>
          {themeOption}
        </label>
      ))}
    </>
  );
}
