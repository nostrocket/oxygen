//todo deprecate this file and use /consensus instead
//todo deprecate precomputed state
import createEventpool from "$lib/consensus/mempool";
import { validate } from "$lib/protocol_validators/rockets";
import { NDKUser, type NDKEvent } from "@nostr-dev-kit/ndk";
import { Mutex } from "async-mutex";
import {
  derived,
  get,
  get as getStore,
  writable
} from "svelte/store";
import { allNostrocketEventKinds } from "../kinds";
import {
  ignitionPubkey,
  mainnetRoot,
  nostrocketIgnitionEvent,
} from "../settings";
import type { Account, Nostrocket } from "../types";
import State from "../types";
import ndk, { ndk_profiles } from "./ndk";
import { profiles } from "./profiles";

export function FUCKYOUVITE(): NDKUser { //vite + svelte = no typescript allowed in components. Change my mind.
  return $ndk.getUser({});
}
const $ndk = getStore(ndk);
const $ndk_profiles = getStore(ndk_profiles);

let r: Nostrocket = new State(JSON.stringify(""));

export const consensusTipState = writable(r); //this is the latest nostrocket state, built from consensus events signed by participants with votepower
let changeStateMutex = new Mutex();

export const allNostrocketEvents = $ndk.storeSubscribe<NDKEvent>(
  { "#e": [mainnetRoot] }, //"#e": [ignitionEvent] , authors: [ignitionPubkey] kinds: allNostrocketEventKinds, "#e": [mainnetRoot]
  { closeOnEose: false }
);

//events randomly go missing if we do not have multiple subscriptions
export const allEventKinds = $ndk.storeSubscribe<NDKEvent>(
  { kinds: allNostrocketEventKinds }, //"#e": [ignitionEvent] , authors: [ignitionPubkey] kinds: allNostrocketEventKinds, "#e": [mainnetRoot]
  { closeOnEose: false }
);

$ndk_profiles.storeSubscribe<NDKEvent>(
  { kinds: [0], authors: [ignitionPubkey] }, //"#e": [ignitionEvent]
  { closeOnEose: false }
);

export const mempool = createEventpool();
export const eventsInState = createEventpool();

export const mempoolEvents = derived(mempool, ($m) => {
  let eventsOnly:NDKEvent[] = []
  $m.forEach((v, k) => {
    if (!eventsOnly.includes(v)) {
      eventsOnly.push(v)
    }
  })
  return eventsOnly
})


allNostrocketEvents.subscribe((e) => {
  if (e[0]) {
    // if (e[0].id == "7ac8cfa0c1e8d2e47c94be10d67a96cce64139ba29903bfc17b5e89cc70579f6") {
    //   console.log(e[0])
    // }
    // if (e[0].id == "305f2ca2fda5d988e41f17aae4deefb32b9cdb5dec42cd6fe2e518ee46592567") {
    //   console.log(e[0])
    // }
    if (!eventsInState.fetch(e[0].id) && !mempool.fetch(e[0].id)) {
      mempool.push(e[0]);
    }
  }
});

allEventKinds.subscribe((e) => {
  if (e[0]) {
    // if (e[0].id == "7ac8cfa0c1e8d2e47c94be10d67a96cce64139ba29903bfc17b5e89cc70579f6") {
    //   console.log(e[0])
    // }
    // if (e[0].id == "305f2ca2fda5d988e41f17aae4deefb32b9cdb5dec42cd6fe2e518ee46592567") {
    //   console.log(e[0])
    // }
    if (!eventsInState.fetch(e[0].id) && !eventsInState.fetch(e[0].id)) {
      mempool.push(e[0]);
    }
  }
});

let preCalculatedStateEvents = derived(allNostrocketEvents, ($nr) => {
  $nr = $nr.filter((event: NDKEvent) => {
    return event.kind == 10311;
  });
  return $nr;
});

export const currentPrecalculatedState = derived(
  preCalculatedStateEvents,
  ($nr) => {
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
  }
);

export const identitiesInTree = derived(currentPrecalculatedState, ($nr) => {
  return $nr.IdentityList;
});

export const rockets = derived(currentPrecalculatedState, ($nr) => {
  return $nr.Rockets;
});

export const rocketMap = derived(currentPrecalculatedState, ($nr) => {
  return $nr.RocketMap;
});

export const identityMap = derived(currentPrecalculatedState, ($nr) => {
  return $nr.IdentityMap;
});

export const nostrocketParticipants = derived(consensusTipState, ($cts) => {
  let orderedList: Account[] = [];
  recursiveList(nostrocketIgnitionEvent, ignitionPubkey, $cts, orderedList);
  return orderedList;
});

function recursiveList(
  rocket: string,
  rootAccount: Account,
  state: Nostrocket,
  orderedList: Account[]
) {
  if (!orderedList.includes(rootAccount)) {
    orderedList.push(rootAccount);
  }
  state.RocketMap.get(rocket)
    ?.Participants.get(rootAccount)
    ?.forEach((pk) => {
      recursiveList(rocket, pk, state, orderedList);
    });
  return orderedList;
}

nostrocketParticipants.subscribe((pkList) => {
  pkList.forEach((pk) => {
    let user = $ndk_profiles.getUser({ hexpubkey: pk });
    user.fetchProfile().then((profile) => {
      if (user.profile) {
        profiles.update((data) => {
          data.set(user.hexpubkey(), user);
          return data;
        });
      }
    });
  });
});

export const nostrocketParticipantProfiles = derived(profiles, ($p) => {
  let orderedProfiles: { profile: NDKUser; index: number }[] = [];
  get(nostrocketParticipants).forEach((pk, i) => {
    let profile = $p.get(pk);
    if (profile) {
      orderedProfiles.push({ profile: profile, index: i });
    }
  });
  return orderedProfiles.reverse();
});

export let notPrecalculatedStateEvents = derived(allNostrocketEvents, ($nr) => {
  $nr = $nr.filter((event: NDKEvent) => {
    return event.kind != 10311;
  });
  return $nr;
});



export let validConsensusEvents = derived(allNostrocketEvents, ($vce) => {
  $vce = $vce.filter((event: NDKEvent) => {
    return validate(event, get(consensusTipState));
  });

  $vce = $vce.filter((event: NDKEvent) => {
    //event previous label == HEAD
    //todo track mutiple HEADs so that we can follow multiple pubkeys:
    //we need the full state too, so just duplicate it for each pubkey that has votepower in the current state.
    return (
      get(consensusTipState).LastConsensusEvent() ==
      labelledTag(event, "previous")
    );
  });
  return $vce;
});

let labelledTag = function (event: NDKEvent, type: string): string | undefined {
  let r: any;
  event.getMatchingTags("e").forEach((tag) => {
    if (tag[tag.length - 1] == type && tag[1].length == 64) {
      r = tag[1];
    }
  });
  return r;
};

validConsensusEvents.subscribe((x) => {
  if (x[0]) {
    let request = labelledTag(x[0], "request");
    if (request) {
      let requestEvent = mempool.fetch(request);
      //todo add mutex
      changeStateMutex.acquire().then(()=>{
        let current = get(consensusTipState);
        if (requestEvent) {
          if (validate(requestEvent, current)) {
            let [ok, newstate] = current.HandleStateChangeEvent(requestEvent);
            if (ok) {
              console.log(245)
              eventsInState.push(x[0]);
              mempool.pop(x[0].id);
              eventsInState.push(requestEvent);
              mempool.pop(requestEvent.id);
              newstate.ConsensusEvents.push(x[0].id);
              processMempool(newstate)
              consensusTipState.set(newstate);
            }
          }
        }
        
        changeStateMutex.release()
      })
    }
  }
});


function processMempool(currentState: Nostrocket):Nostrocket {
    let handled: NDKEvent[] = []
    mempool.singleIterator().forEach(e=>{
      switch (e.kind) {
        case 30000:
          let [newState, success] = handleIdentityEvent(e, currentState)
          if (success) {
            currentState = newState
            handled.push(e)
          }
      }
    })
    if (handled.length > 0) {
      handled.forEach(h=>{
        mempool.pop(h.id)
        eventsInState.push(h)
      })
      return processMempool(currentState)
    }
    return currentState
}

function handleIdentityEvent(e: NDKEvent, c: Nostrocket):[Nostrocket, boolean] {
      let successful = false
      e.getMatchingTags("d").forEach((dTag) => {
        if (dTag[1].length == 64) {
            let r = c.RocketMap.get(dTag[1]);
            if (r) {
              if (r.updateParticipants(e)) {
                c.RocketMap.set(r.UID, r);
                eventsInState.push(e);
                mempool.pop(e.id);
                successful = true
              }
            }
        }
      });
      return [c, successful]
}