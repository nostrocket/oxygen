/* This is the current state of Nostrocket as produced by following the consensus algorithm
Events in mempool are NOT handled here except if they are referred to by a consensus event.

See nostrocket/NIPS/Consensus.md for an overview of how consensus works.
*/

import { allNostrocketEventKinds } from "$lib/kinds"
import { allNostrocketEvents } from "$lib/stores/state"
import type { Nostrocket } from "$lib/types"
import State from "$lib/types"
import type { NDKEvent } from "@nostr-dev-kit/ndk"
import { Mutex } from "async-mutex"
import { derived, get, writable } from "svelte/store"

let r: Nostrocket = new State("{}")

//this is the latest nostrocket state, built from consensus events signed by participants with votepower
export const consensusTipState = writable(r) 
let changeStateMutex = new Mutex()

consensusTipState.subscribe((x)=>{
    console.log(x)
})


export let validConsensusEvents = derived(allNostrocketEvents, ($vce) => {
    $vce = $vce.filter((event: NDKEvent) => {
        return event.kind == 15172008
      })
      $vce = $vce.filter((event: NDKEvent) => {
        //pubkey has votepower
        return true //
      })
      $vce = $vce.filter((event: NDKEvent) => {
         //event previous label == HEAD
        return get(consensusTipState).LastConsensusEvent == previousTag(event)
      })
})


let previousTag = function(event: NDKEvent): string | undefined {
  event.getMatchingTags("e").forEach((tag)=>{
    console.log(tag)
  })
  return undefined
}
//todo move things from state.ts to here