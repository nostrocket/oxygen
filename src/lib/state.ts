import type { ExtendedBaseType, NDKEventStore } from "@nostr-dev-kit/ndk-svelte";
import { allNostrocketEventKinds } from "./kinds";
import { ignitionPubkey } from "./settings";
import ndk from "./stores/ndk";
import State from "./types";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { derived, get as getStore, writable, type Readable } from "svelte/store";

//export const CurrentState = writable<Nostrocket>(State)

const $ndk = getStore(ndk);

// export let nostrocketState: Readable<Nostrocket> | undefined;
// export let allNostrocketEvents: NDKEventStore<NDKEvent> | undefined = undefined;
// export let testEvents: Readable<NDKEvent[]>;// | undefined;

// export function initNostrocketState() {
//     console.log("initNostrocketState")
//     allNostrocketEvents = $ndk.storeSubscribe(
//         { kinds: allNostrocketEventKinds },
//         { closeOnEose: false }
//     )
//     testEvents = derived(allNostrocketEvents, $allNostrocketEvents => {
//         return $allNostrocketEvents
//     })

// }

let allNostrocketEvents = $ndk.storeSubscribe<NDKEvent>(
  { kinds: allNostrocketEventKinds },
  { closeOnEose: false }
);

let notPrecalculatedStateEvents = derived(allNostrocketEvents, ($nr) => {
  $nr = $nr.filter((event: NDKEvent) => {
    return event.kind != 10311
  })
return $nr
});

export const otherEvents = notPrecalculatedStateEvents

let preCalculatedStateEvents = derived(allNostrocketEvents, ($nr) => {
  $nr = $nr.filter((event: NDKEvent) => {
    return event.kind == 10311
  })
return $nr
});

export const currentPrecalculatedState = derived(preCalculatedStateEvents, ($nr) => {
  let timestamp = 0;
  $nr = $nr.filter((event: NDKEvent) => {
    if (event.created_at) {
      if (event.created_at > timestamp && event.pubkey === ignitionPubkey) {
        timestamp = event.created_at;
        return true;
      }
    }
  });
  $nr = $nr.filter((event) => {
    if (event.created_at) {
      return event.created_at === timestamp;
    }
  });
  if ($nr[0]) {
    let $stateFromEvent = new State($nr[0].content);
    return $stateFromEvent;
  }
  return new State("{}");
});

export const identitiesInTree = derived(currentPrecalculatedState, ($nr) => {
  return $nr.IdentityList;
});

export const rockets = derived(currentPrecalculatedState, ($nr) => {
  return $nr.Rockets;
});

export const rocketMap = derived(currentPrecalculatedState, ($nr) => {
  return $nr.RocketMap
})