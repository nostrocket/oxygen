import { derived, get, writable, type Readable } from "svelte/store";
import { Nostrocket } from "./types";
import { labelledTag } from "$lib/helpers/shouldBeInNDK";
import { validate } from "$lib/protocol_validators/rockets";
import { changeStateMutex } from "./mutex";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { allNostrocketEvents, eose } from "../event_sources/relays/ndk";
import { Mutex } from "async-mutex";
import { kindsThatNeedConsensus } from "../event_sources/kinds";
import { initProblems, problemEvents } from "./soft_state/problems";

let r: Nostrocket = new Nostrocket(JSON.stringify(""));

export const consensusTipState = writable(r);
let _mempool = new Map<string,NDKEvent>()
let _inState = new Set<string>()
export let mempool = writable(_mempool)
export let inState = writable(_inState) //these notes exist in state
export let failed = writable(_inState) //these notes are invalid
export let eligableForProcessing = derived([mempool, inState, failed], ([$m, $in, $failed])=>{
  //console.log([...$m])
  let filtered = [...$m.values()].filter((e)=>{
    return ((![...$in].includes(e.id)) && (![...$failed].includes(e.id)))
  })
  //console.log(filtered)
  return filtered
})


export let stateChangeEvents = derived(eligableForProcessing, ($nis)=>{
  let list: NDKEvent[] = [];
  $nis.forEach((e) => {
    try {
      if (kindsThatNeedConsensus.includes(e.kind!)) {
        list.push(e);
      }
    } catch {}
  });
  return list;
})


allNostrocketEvents.subscribe((e) => {
  if (e[0]) {
    mempool.update((m)=>{
      return m.set(e[0].id,e[0])
    })
  }
});

export let notesInState = derived([inState, mempool], ([$in, $mem])=>{
  let filtered = [...$mem.values()].filter((e)=>{
    return (([...$in].includes(e.id)))
  })
  //console.log(filtered)
  return filtered
})

//Build the current Hard state from Consensus Notes (follow a consensus chain and handle each embedded hard state change request)


//Build the current Soft state from Soft State Change Requests (handle these directly from relays)
eose.subscribe((val)=>{
    //or maybe just do this when we have reached current HEAD instead of on EOSE
    if (val) {
      initProblems(consensusTipState)
      watchMempool();
    }
  }) 
  const watchMempoolMutex = new Mutex();
async function watchMempool() {
  let last = 0;
  watchMempoolMutex.acquire().then(() => {
    eligableForProcessing.subscribe(() => {
      changeStateMutex("state:244").then((release) => {
        let current = get(consensusTipState);
        let newstate = processSoftStateChangeReqeustsFromMempool(current, eligableForProcessing);
        consensusTipState.set(newstate);
        release();
      });
    });
  });
}

function processSoftStateChangeReqeustsFromMempool(currentState: Nostrocket, eligible:Readable<NDKEvent[]>): Nostrocket {
    let handled: NDKEvent[] = [];
    //let newState:Nostrocket = clone(currentState)
    let currentList = [...get(eligible)]
    currentList.forEach((e) => {
      //todo clone not ref
      switch (e.kind) {
        case 30000: {
          let [n, success] = handleIdentityEvent(e, currentState);
          if (success) {
            currentState = n;
            handled.push(e);
          }
        }
        case 15171971:
        case 15171972:
        case 15171973:
        case 31971: {
          let [n, success] = handleProblemEvent(e, currentState);
          if (success) {
            currentState = n;
            handled.push(e);
          }
        }
      }
    });
    if (handled.length > 0) {
      handled.forEach((h) => {
        inState.update((is)=>{
          is.add(h.id)
          return is
        })
      });
      return processSoftStateChangeReqeustsFromMempool(currentState, eligible);
    }
    return currentState;
  }

  function handleProblemEvent(e: NDKEvent, c: Nostrocket): [Nostrocket, boolean] {
    switch (e.kind) {
      case 15171973:
        problemEvents.update(pe=>{
          pe.set(e.id, e)
          return pe
        })
        return [c, true]
      case 15171971:
        //Problem ANCHOR
        return c.HandleLightStateChangeEvent(e);
      case 31971:
        //Problem HEAD
        return c.HandleLightStateChangeEvent(e);
    }
    return [c, false];
  }
  
  function handleIdentityEvent(
    e: NDKEvent,
    c: Nostrocket
  ): [Nostrocket, boolean] {
    let successful = false;
    e.getMatchingTags("d").forEach((dTag) => {
      if (dTag[1].length == 64) {
        let r = c.RocketMap.get(dTag[1]);
        if (r) {
          if (r.updateParticipants(e)) {
            c.RocketMap.set(r.UID, r);
            inState.update(is=>{
              is.add(e.id)
              return is
            })
            successful = true;
          }
        }
      }
    });
    return [c, successful];
  }



export const consensusNotes = derived(eligableForProcessing, ($vce) => {
    $vce = $vce.filter((event: NDKEvent) => {
      return validate(event, get(consensusTipState), 15172008);
    });
  
    $vce = $vce.filter((event: NDKEvent) => {
      //event previous label == HEAD
      //todo track mutiple HEADs so that we can follow multiple pubkeys:
      //we need the full state too, so just duplicate it for each pubkey that has votepower in the current state.
      return (
        get(consensusTipState).LastConsensusEvent() ==
        labelledTag(event, "previous", "e")
      );
    });
    return $vce;
  });

  consensusNotes.subscribe((x) => {
    if (x[0]) {
      let request = labelledTag(x[0], "request", "e");
      if (request) {
        let requestEvent:NDKEvent|undefined = undefined;
        get(mempool).forEach((e)=>{
          //todo make this not shitty
          if (e.id == request) {
            requestEvent = e
          }
        })
        changeStateMutex(request).then((release) => {
          let current = get(consensusTipState);
          if (!requestEvent) {
            console.log(
              "event: ",
              request,
              " for consensus event ",
              x[0].id,
              " is not in mempool"
            );
          }
          if (requestEvent) {
              let needsConsensus = kindsThatNeedConsensus.includes(requestEvent.kind!)
              let valid = (validate(requestEvent, current) && needsConsensus)
              if (!valid) {
                failed.update(f=>{
                  f.add(x[0].id)
                  return f
                })
              }
              if (valid) {
                //todo use copy instead of reference (newstate is just a reference here) have to write a manual clone function for this
                let [newstate, ok] = current.HandleStateChangeEvent(requestEvent);
                if (ok) {
                  inState.update(is=>{
                    is.add(requestEvent!.id!)
                    is.add(x[0].id)
                    return is
                  })
                  newstate.ConsensusEvents.push(x[0].id);
                  //todo only do this after we reach the HEAD of the longest consensus chain:
                  processSoftStateChangeReqeustsFromMempool(newstate, eligableForProcessing);
                  consensusTipState.set(newstate);
                } else {
                  //todo add to failed if it's something that is definitely invalid under all possible circumstances
                }
              }
          }
          release();
        });
      }
    }
  });