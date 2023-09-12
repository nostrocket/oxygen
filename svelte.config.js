import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';
import { optimizeImports } from "carbon-preprocess-svelte";
import { vitePreprocess } from '@sveltejs/kit/vite';

const dev = process.argv.includes('dev');

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
    adapter: adapter(),
    paths: {
      base: dev? '' :'/oxygen',
    }
  }
}

export default config;
