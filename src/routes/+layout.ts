//if pre-render is set to true, then adapter-static fails to compile [routes] properly.
//we set it to false and also add an index.html fallback to svelte config so that it
//properly compiles to something that can be served by a static web server like github pages.
export const prerender = false;
export const ssr = false;
