import type { ExtendedBaseType, NDKEventStore } from "@nostr-dev-kit/ndk-svelte";
import { allNostrocketEventKinds } from "../kinds";
import { ignitionEvent, ignitionPubkey } from "../settings";
import ndk from "./ndk";
import State from "../types";
import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { derived, get as getStore, writable, type Readable, readable } from "svelte/store";
import type { Nostrocket } from "../types";
import {Mutex} from 'async-mutex';
import createEventpool from "$lib/consensus/mempool";


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

let r: Nostrocket = new State("{}")

export const consensusTipState = writable(r) //this is the latest nostrocket state, built from consensus events signed by participants with votepower
let changeStateMutex = new Mutex()


let allNostrocketEvents = $ndk.storeSubscribe<NDKEvent>(
  { kinds: allNostrocketEventKinds,"#e": [ignitionEvent], authors: [ignitionPubkey]},//"#e": [ignitionEvent]
  { closeOnEose: false }
);

let eventHasCausedAStateChange = new Map; //todo use cuckoo filter instead
export const mempool = createEventpool()

let notPrecalculatedStateEvents = derived(allNostrocketEvents, ($nr) => {
  $nr = $nr.filter((event: NDKEvent) => {
    return event.kind != 10311
  })
return $nr
});

allNostrocketEvents.subscribe((e) => {
  if (e[0]) {
    mempool.push(e[0])
    changeStateMutex.acquire().then(()=>{
      if (!eventHasCausedAStateChange.has(e[0].id)) {
        let nrs = getStore(consensusTipState)
        console.log(e[0])
        switch (e[0].kind) {
          case 15171031:
            let t = e[0].getMatchingTags("n")
            if (t) {
              if (t[0][1]){
                // state.update((s) => {
                //   s.RocketMap.set(e[0].id, )
                // })
                console.log(t[0][1])
              }
            }
            console.log(e[0].tags)
        }
      }
      changeStateMutex.release()
    })

  }
})




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
    // r = new State($nr[0].content)
    // state.update((x) => {
    //   return r
    // })
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