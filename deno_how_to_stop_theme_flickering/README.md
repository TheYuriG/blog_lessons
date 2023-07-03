# How to stop Theme flickering in Fresh

> Also: view this post on my
> [blog](https://www.theyurig.com/blog/stopping-theme-flickering-deno-fresh).

In the
[previous post](http://localhost:8000/blog/how-create-theme-switcher-deno-fresh),
we built a simple Theme Switcher using Preact and Fresh on top of Deno. Two
things were missing in that implementation we are going to fix both of them now:

To understand how to fix both of those problems, we first need to understand why
they happened in the first place.

## The Island Architecture

The [Islands Architecture](https://www.patterns.dev/posts/islands-architecture)
is a very interesting design pattern. You serve static HTML content (the
"ocean") to the client's browser and only hydrate a little of Javascript (the
"island") in specific portions of the User Interface, upon user request. By
default, this approach will never ship any Javascript to the client, essentially
creating zero overhead on served pages, which leads to more performant pages
with higher Lighthouse scores.

Fresh wasn't the first to come up with this idea, mind you.
[Remix](https://remix.run/) (from the same creators of
[React Router](https://reactrouter.com/en/main/start/overview) (!))had already
started working on this in early 2022, they even tried to sell a license to use
the framework, which
[didn't work well](https://twitter.com/remix_run/status/1460652199269179393) for
them.

So by now, you might have realized that not shipping Javascript by default has
its drawbacks. If the page first needs to load before it can download the
Javascript to change the theme colors, then we can't have our theme applied from
the get-go, with no choice but to have our clients have to put up with the
flickering, right? Well, not exactly...

## Opting out of the Islands Architecture

It's possible that we can ship the required Javascript on every page, but in
doing so, you need to understand the tradeoffs:

- You introduce consistent overhead to every page load, which will progressively
  worsen your Lighthouse page performance score, the more you do it.
- You are deviating from the main design choice for the framework, which means
  that you will not find a lot of resources to do things this way from this
  point onwards. If you have questions, you will have to mostly figure something
  out by yourself.

At this point, I have to ask you: Is this feature essential for your project? Is
the design of your website impossible to be done in a happy medium between Light
and Dark modes? If the answer to both of these questions is "yes", we can now
start looking into how to break the rules.

## Adding a script file to every response

Be very careful about the `script` tags that you import on your project. Not
knowing what you are doing can leave you (and your users) vulnerable to Cross
Site Scripting attacks (XSS, for short). Make sure that you properly review any
code that suggests using these and, if in doubt, don't use them in your project!

In our case, our implementation is incredibly simple. We just add a small script
to the response's `<head>` that checks if the user has a theme saved in
`localStorage` and if they don't, we try to apply their OS-preferred color
scheme. Let's have a look:

```ts
// /routes/index.tsx (but can be any page)
export default function Home() {
  return (
    <>
      <Head>
        // must not be deferred/module to stop flickering!
        <script src="/themeSwitcher.js"></script>
      </Head>
      // your page response body goes here
    </>
  );
}
```

And inside the script file:

```ts
// /static/themeSwitcher.js
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
```

In order:

- Check if there is a theme already saved on `localStorage`. If there isn't one,
  check what's the user preferred color scheme, save it, and set
  `window.showDarkMode`. If there is, you just set `window.showDarkMode` on/off
  based on the saved theme.
- Check `window.showDarkMode` and apply the colors to the `root` element for
  either mode based on that being `true` or `false`.

Now all we gotta do is update our component and we are done!

```ts
// /islands/themeSwitcher.tsx (updated)
...
const [theme, setTheme] = useState(
  // @ts-ignore This property gets set by themeSwitcher.js in <Head>
  window.showDarkMode === true ? "Dark" : "Light",
);

useEffect(() => {
  if (isInitialMount.current) {
    isInitialMount.current = false;
    return;
  }
  ...
}
...
```

Because `window.showDarkMode` is set within the response's `<head>`, Typescript
doesn't know that it exists and will give you a warning, hence the suppression
above. Since your `useEffect()` no longer needs to set the theme based on what
is saved on `localStorage`, we can remove that bit too, leaving the initial
check to only validate if it's the first run and skip when it is.

So there you have it, a Theme Switcher that sets the correct theme, acknowledges
the user's preferences, and doesn't flicker on the initial load.

## Alternatives to using script tags

What other ways could you possibly implement a Theme Switcher without needing to
script files on every request?

One of the options would be to use route-based theming. You could create your
entire website nested in either a `/light` or `/dark` route (or better yet, a
single `/[theme]` route!), and have your index redirect to either of those based
on their OS color-scheme preference. The drawback to this approach is that you
can't give the users a pretty theme transition when they switch themes, since
that will force an entire page reload when they get redirected, but regardless,
it's still a possibility that you could implement.

Another option would be to not save the theme to `localStorage` and also never
redirect, essentially turning your application into a SPA, making your users
navigate through pages using
[React Router](https://reactrouter.com/en/main/start/overview) instead. The
drawback to this approach would be to have the theme reset on every visit, which
would be annoying if people had to come back to your website regularly. If you
are just creating a portfolio website that is meant for recruiters to check once
and dip, that is not a big deal, but for a blogging website (like this one!),
it's pretty much unacceptable. This option also isn't really what Fresh is going
for either, so at this point you might as well just use another framework
entirely instead, maybe even going full
[NextJS + React](https://vercel.com/templates/next.js/nextjs-boilerplate)
instead.
