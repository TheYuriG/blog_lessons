# How to Create a Theme Switcher with Fresh

> Also: view this post on my
> [blog](https://www.theyurig.com/blog/how-create-theme-switcher-deno-fresh).

Being able to customize your Theme can be a huge user experience upgrade to any
website. While some websites use a default Dark Theme, the majority of the
internet still sticks to creating content in Light Mode as default (and
sometimes the only option).

However, if you have tried to do this on your own using Fresh before, you might
have run into a problem... or many. In this blog post, I'll explain how I've
created my theme, what issues I've faced, and how I've solved them.

## What is Fresh?

[Fresh](https://fresh.deno.dev/) is the official framework to create web apps
using Deno's Javascript runtime. It features no build step, zero-config,
Typescript support out-of-the-box, JIT-rendering, and uses the Island design
architecture (more about this in a minute). The premise here is very simple:
Single Page Applications rely heavily on the client's devices to build the
content of webpages and that creates overhead that impacts performance. Fresh,
just like [Remix](https://remix.run/) (and to some extent
[NextJS](https://nextjs.org/)), aims to move all the rendering back to the
server, serving exclusively static HTML pages, hydrating any interactivity only
when/if necessary. While that's amazing for Lighthouse performance, it comes
with its own sets of drawbacks (more on that in the next post).

Fresh uses Preact under the hood to compile the JSX/TSX files into static HTML
that is then sent to the client. If you have experience with
[React](https://react.dev/) or [Solid](https://www.solidjs.com/), you shouldn't
have any trouble adapting, especially if you have experience building Full Stack
projects.

## Creating A Theme Switcher

Let's create a very simple Theme Switcher:

```ts
// /islands/ThemeSwitcher.tsx
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
```

This creates a radio input that has `Dark` selected by default and allows you to
toggle between modes. Switching themes will toggle between the Light and the
Dark versions of the theme for this blog, now let's make sure we can save the
changes when the user clicks either input. Feel free to replace the values of
`--base-color`, `--neutral-color`, and `--accent-color` with the values for your
theme.

```ts
// /islands/ThemeSwitcher.tsx (updated)
import { useEffect, useRef, useState } from "preact/hooks";
...
const isInitialMount = useRef(true);

useEffect(() => {
    const savedTheme = localStorage.getItem("theme")

    if (isInitialMount.current === true) {
        if (savedTheme !== null && savedTheme !== theme){
            setTheme(() => savedTheme)
            return
        }

      isInitialMount.current = false;
      return;
    }
    localStorage.setItem("theme", theme);
...
```

We have added a reference to the `useEffect()` to avoid having it saving the
current `theme` to `localStorage` on the first render.

What the `useEffect()` does, in order:

- Runs on start, checks if there is a theme saved (if not, `savedTheme` will be
  `null`), and sets the current theme as the `savedTheme`, if they are
  different, then stops (remember that `useEffect()` is using the `theme` as a
  dependency so not returning here would cause an infinite loop!).
- After setting the `theme` equal to `localStorage`'s `savedTheme` is the same
  as the `theme`, it will skip the first `if` check and negate the
  `isInitialMount` value and stop.
- (Optional) If the `theme` is updated, it will skip both if checks, save the
  `theme` to `localStorage`, and applies it.

This website uses an improved version of the same Theme Switcher created in this
post, which you can check the source code for
[right here](https://github.com/TheYuriG/deno-portfolio/blob/0051fc7369f714a7562d303f760e148efc753ea4/islands/ThemeSwitcher.tsx).

### What's next?

If you have been following along, you might have noticed a few issues with it,
like flickering on first load or the inability to check for user preferences.
Let's address those problems on those on the
[next blog post](https://www.theyurig.com/blog/stopping-theme-flickering-deno-fresh).
