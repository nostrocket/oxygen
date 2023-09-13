import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/kit/vite";
import { optimizeImports } from "carbon-preprocess-svelte";
import preprocess from "svelte-preprocess";

const dev = process.argv.includes("dev");

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    optimizeImports(),
    vitePreprocess(),
    // preprocess({
    // 	postcss: true
    // })
  ],
  kit: {
    adapter: adapter({
      fallback: "index.html",
    }),
    paths: {
      base: dev ? "" : "/oxygen",
      //base: '' //don't know how to pass build options to vite compilier, so I just manually change this here when I want to compile it to run static-local.
    },
  },
};

export default config;
