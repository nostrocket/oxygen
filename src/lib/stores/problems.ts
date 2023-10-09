import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { get, writable } from "svelte/store";
import { consensusTipState } from "./state";
import { mainnetRoot } from "$lib/settings";
import ndk from "./ndk";

export const problemEvents = writable<Map<string, NDKEvent>>(new Map());
const $ndk = get(ndk);

export async function fetchProblemEvents() {
    consensusTipState.subscribe(state=>{
        state.Problems?.forEach(p=>{
           if (p.Head) {
            p.Head.getMatchingTags("")
            let sub = $ndk.storeSubscribe<NDKEvent>(
                { "#e": [p.UID] }, //"#e": [ignitionEvent] , authors: [ignitionPubkey] kinds: allNostrocketEventKinds, "#e": [mainnetRoot]
                { closeOnEose: true }
              );
              sub.subscribe(e=>{
                if (e[0]) {
                    problemEvents.update(state=>{
                        state.set(e[0].id, e[0])
                        return state
                    })
                }
              })
           }
        })
    })
}