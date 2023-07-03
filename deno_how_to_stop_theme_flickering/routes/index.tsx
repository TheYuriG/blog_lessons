import { Head } from "$fresh/runtime.ts";

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
