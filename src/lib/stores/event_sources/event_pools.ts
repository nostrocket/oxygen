//This is a local non-persisted cache of events.

import createEventpool from "$lib/factories/event_pool";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { derived, get } from "svelte/store";
import { allNostrocketEvents } from "./relays/ndk";
import { labelledTag } from "$lib/helpers/shouldBeInNDK";
import { rootEventID } from "../../../settings";
import { validate } from "$lib/protocol_validators/rockets";


// export const mempool = createEventpool();
// export const eventsInState = createEventpool();

// export const mempoolEvents = derived(mempool, ($m) => {
//   let eventsOnly: NDKEvent[] = [];
//   $m.forEach((v, k) => {
//     if (!eventsOnly.includes(v)) {
//       eventsOnly.push(v);
//     }
//   });
//   eventsOnly.filter((event: NDKEvent) => {
//     return labelledTag(event, "root", "e") == rootEventID;
//   });
//   return eventsOnly;
// });

// export const eventsInStateList = derived(eventsInState, ($m) => {
//   let eventsOnly: NDKEvent[] = [];
//   $m.forEach((v, k) => {
//     if (!eventsOnly.includes(v)) {
//       eventsOnly.push(v);
//     }
//   });
//   return eventsOnly;
// });

// allNostrocketEvents.subscribe((e) => {
//   if (e[0]) {
//     // if (e[0].id == "7ac8cfa0c1e8d2e47c94be10d67a96cce64139ba29903bfc17b5e89cc70579f6") {
//     //   console.log(e[0])
//     // }
//     // if (e[0].id == "305f2ca2fda5d988e41f17aae4deefb32b9cdb5dec42cd6fe2e518ee46592567") {
//     //   console.log(e[0])
//     // }
//     if (!eventsInState.fetch(e[0].id) && !mempool.fetch(e[0].id)) {
//       mempool.push(e[0]);
//     }
//   }
// });
