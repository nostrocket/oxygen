//todo deprecate this file and use /consensus instead
//todo deprecate precomputed state


import type { ExtendedBaseType, NDKEventStore } from "@nostr-dev-kit/ndk-svelte";
import { allNostrocketEventKinds } from "../kinds";
import { ignitionEvent, ignitionPubkey } from "../settings";
import ndk from "./ndk";
import State from "../types";
import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { derived, get as getStore, writable, type Readable, readable, get } from "svelte/store";
import type { Nostrocket } from "../types";
import {Mutex} from 'async-mutex';
import createEventpool from "$lib/consensus/mempool";
import { validate } from "$lib/protocol_validators/rockets";


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

let r: Nostrocket = new State(JSON.stringify(""))

export const consensusTipState = writable(r) //this is the latest nostrocket state, built from consensus events signed by participants with votepower
let changeStateMutex = new Mutex()


export const allNostrocketEvents = $ndk.storeSubscribe<NDKEvent>(
  { kinds: allNostrocketEventKinds,"#e": [ignitionEvent], authors: [ignitionPubkey]},//"#e": [ignitionEvent]
  { closeOnEose: false }
);

export const mempool = createEventpool()
export const eventsInState = createEventpool()


allNostrocketEvents.subscribe((e) => {
  if (e[0]) {
    if (!eventsInState.fetch(e[0].id)) {
      mempool.push(e[0])
      changeStateMutex.acquire().then(()=>{
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
              //console.log(e[0].tags)
          }
              changeStateMutex.release()
      })
    }
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

export const identityMap = derived(currentPrecalculatedState, ($nr) => {
  return $nr.IdentityMap
})



export let notPrecalculatedStateEvents = derived(allNostrocketEvents, ($nr) => {
  $nr = $nr.filter((event: NDKEvent) => {
    return event.kind != 10311
  })
return $nr
});


export let validConsensusEvents = derived(allNostrocketEvents, ($vce) => {
  $vce = $vce.filter((event: NDKEvent) => {
      return validate(event, get(consensusTipState))
    })
  
    $vce = $vce.filter((event: NDKEvent) => {
       //event previous label == HEAD
       //todo track mutiple HEADs so that we can follow multiple pubkeys:
       //we need the full state too, so just duplicate it for each pubkey that has votepower in the current state.
      return get(consensusTipState).LastConsensusEvent() == labelledTag(event, "previous")
    })
    return $vce
})


let labelledTag = function(event: NDKEvent, type: string): string | undefined {
  let r: any
event.getMatchingTags("e").forEach((tag)=>{
  if (tag[tag.length-1] == type && tag[1].length == 64) {
    r = tag[1]
  }
})
return r
}

validConsensusEvents.subscribe((x)=>{
  if (x[0]) {
    let request = labelledTag(x[0], "request")
    if (request) {
      let requestEvent = mempool.fetch(request)
      let current = get(consensusTipState)
      if (requestEvent) {
        if (validate(requestEvent, current)) {
          let [ok, newstate] = current.HandleStateChangeEvent(requestEvent)
          if (ok) {
            eventsInState.push(x[0])
            mempool.pop(x[0].id)
            eventsInState.push(requestEvent)
            mempool.pop(requestEvent.id)
            newstate.ConsensusEvents.push(x[0].id)
            consensusTipState.set(newstate)
          }
          
        }
      }
    }
  }
})