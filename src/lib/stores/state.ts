//todo deprecate this file and use /consensus instead
//todo deprecate precomputed state
import createEventpool from "$lib/consensus/mempool";
import { validate } from "$lib/protocol_validators/rockets";
import type { NDKUser, NDKEvent } from "@nostr-dev-kit/ndk";
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
import { Nostrocket, type Account, Problem, type Rocket } from "../types";
import ndk, { ndk_profiles } from "./ndk";
import { profiles } from "./profiles";
import { unixTimeNow } from "$lib/helpers/mundane";

export function FUCKYOUVITE(): NDKUser { //vite + svelte = no typescript allowed in components. Change my mind.
  return $ndk.getUser({});
}
const $ndk = getStore(ndk);
const $ndk_profiles = getStore(ndk_profiles);

let r: Nostrocket = new Nostrocket(JSON.stringify(""));

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
        if (!requestEvent) {
          console.log("FAILED to get event: ", request)
        }
        if (requestEvent) {
          if (validate(requestEvent, current)) {
            //todo use copy instead of reference (newstate is just a reference here) have to write a manual clone function for this
            let [newstate, ok] = current.HandleStateChangeEvent(requestEvent);
            if (ok) {
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

allNostrocketEvents.onEose(()=>{
  console.log("EOSE")
  watchMempool()
})

var watchMempoolMutex = new Mutex()
async function watchMempool() {
  let last = 0
  watchMempoolMutex.acquire().then(()=>{
    mempool.subscribe(()=>{
      changeStateMutex.acquire().then(()=>{
        let current = get(consensusTipState);
        let newstate = processMempool(current)
        consensusTipState.set(newstate);
        changeStateMutex.release()
      })
    })
  })

}

function processMempool(currentState: Nostrocket):Nostrocket {
    let handled: NDKEvent[] = []
    let newState = currentState
    mempool.singleIterator().forEach(e=>{
      //todo clone not ref
      switch (e.kind) {
        case 30000:
          {
            let [n, success] = handleIdentityEvent(e, newState)
            if (success) {
              newState = n
              handled.push(e)
            }
          }
        case 15171971: case 15171972: case 15171973: case 31971:
          {
            let [n, success] = handleProblemEvent(e, newState)
            if (success) {
              newState = n
              handled.push(e)
            }
          }
      }
    })
    if (handled.length > 0) {
      handled.forEach(h=>{
        mempool.pop(h.id)
        eventsInState.push(h)
      })
      return processMempool(newState)
    }
    return newState
}


function handleProblemEvent(e: NDKEvent, c: Nostrocket):[Nostrocket, boolean] {
  switch (e.kind) {
    case 15171971:
      //Problem ANCHOR
      return c.HandleLightStateChangeEvent(e)
      case 31971:
        //Problem HEAD
        return c.HandleLightStateChangeEvent(e)
  }
  return [c, false]
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

export const Problems = derived(consensusTipState, ($nr) => {
  let problems: Problem[] = []
  $nr.Problems.forEach(p=>{
    if (p.Head) {
      problems.push(p)
    }
  })
  //return $nr.Problems
  return problems
})

export const Rockets = derived(consensusTipState, ($nr) => {
return $nr.RocketMap
})