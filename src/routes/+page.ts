// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
import { initialState } from "$lib/state";
export const prerender = true;
export const ssr = false;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
await delay(2000);
initialState();
