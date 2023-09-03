import type { Kind } from "nostr-tools";
import type { NDKFilter } from "@nostr-dev-kit/ndk";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { initalRootIds } from "./state";
import ndkStore from "./ndk";
import { get } from "svelte/store";
import { writable } from "svelte/store";
const ndk = get(ndkStore);
type Database = Record<string, NDKEvent>;
const db: Database =  await beginListeningForReplies();
const dbStore = writable(db);

export default dbStore;

async function beginListeningForReplies() {
  let db: Database = {};
  let statusResult;
  try {
    const statusKind = 1 as Kind;
    const filter: NDKFilter = {
      kinds: [statusKind],
      ["#e"]: [initalRootIds.get("IgnitionEvent") as string],
    };
    const a = await ndk.fetchEvents(filter);
    for (const ev of a) {
      db[ev.id] = ev;
    }
    console.log("success");
  } catch (e) {
    console.log("fail", e);
  }
  return db;
}
