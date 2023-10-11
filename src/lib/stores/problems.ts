import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { get, writable } from "svelte/store";
import { consensusTipState } from "./state";
import { mainnetRoot } from "$lib/settings";
import ndk from "./ndk";

export const problemEvents = writable<Map<string, NDKEvent>>(new Map());
const $ndk = get(ndk);

export async function fetchProblemEvents(id:string | undefined) {
    if (id) {
        if (!get(problemEvents).get(id)) {
            fetch({ids:[id]})
        }
       }
    consensusTipState.subscribe(state=>{
        state.Problems?.forEach(p=>{
           if (p.Head) {
            // commitEventID = GetCommitEventID(p.Head)
            let filter:NDKFilter = {
                "#e": [p.UID]
            }
            fetch(filter)
           }
        })
    })
}
//"#e": [ignitionEvent] , authors: [ignitionPubkey] kinds: allNostrocketEventKinds, "#e": [mainnetRoot]
async function fetch(filter:NDKFilter) {
    let sub = $ndk.storeSubscribe<NDKEvent>(filter, { closeOnEose: true });
      sub.subscribe(e=>{
        if (e[0]) {
            problemEvents.update(state=>{
                state.set(e[0].id, e[0])
                return state
            })
        }
      })
}

export function GetCommitEventID(e:NDKEvent | undefined):string {
    let val = ""
    if (e) {
        console.log(44)
        e.getMatchingTags("t").forEach((t)=>{
            if (t[t.length-1] == "commit") {
                if (t[1].length == 64) {
                    val = t[1]
                }
            }
        })
    }
    return val
}

export function GetTextEventID(e:NDKEvent | undefined):string {
    let val = ""
    if (e) {
        e.getMatchingTags("e").forEach((t)=>{
            if (t[t.length-1] == "text") {
                if (t[1].length == 64) {
                    val = t[1]
                    fetchProblemEvents(val)
                }
            }
        })
    }
    console.log(val)
    return val
}

export function GetTitleFromTextEvent(e:NDKEvent | undefined):string {
    let val = ""
    console.log(74)
    if (e) {
        e.getMatchingTags("t").forEach((t)=>{
            if (t[t.length-1] == "title") {
                if (t[1].length > 0) {
                    val = t[1]
                }
            }
        })
    }
    return val
}