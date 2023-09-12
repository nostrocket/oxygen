import adapter from '@sveltejs/adapter-static';
import { optimizeImports } from "carbon-preprocess-svelte";

const dev = process.argv.includes('dev');

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [optimizeImports()],
  kit: {
    adapter: adapter(),
    paths: {
      base: dev? '' :'/oxygen',
    }
  }
}

export default config;
