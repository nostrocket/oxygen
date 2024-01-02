import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/kit/vite";
import { optimizeImports } from "carbon-preprocess-svelte";

const dev = process.argv.includes("dev");

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // preprocess: [
  //   optimizeImports(),
  //   vitePreprocess(),
  //   // preprocess({
  //   // 	postcss: true
  //   // })
  // ],
  preprocess: [vitePreprocess(), optimizeImports()],
  kit: {
    adapter: adapter({
      fallback: "404.html",
    }),
    prerender: {
      crawl: false,
    },
    paths: {
      base: dev ? "" : "",
      //base: '' //don't know how to pass build options to vite compilier, so I just manually change this here when I want to compile it to run static-local.
    },
  },
  vitePlugin: {
    inspector: {
      holdMode: true,
      toggleKeyCombo: "meta-shift",
    },
  },
};

export default config;
