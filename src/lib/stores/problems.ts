import type { NDKEvent, NDKFilter } from "@nostr-dev-kit/ndk";
import { get, writable, type Writable } from "svelte/store";
import ndk from "./ndk";
import { consensusTipState } from "./state";

export const problemEvents = writable<Map<string, NDKEvent>>(new Map());
export function getProblemEvent(id:string):NDKEvent|undefined {
    let e = get(problemEvents).get(id)
    if (e) {return e} else if (!requested.get(id)) {
        fetchEventsAndUpsertStore({ids:[id]}, problemEvents)
    }
}
const $ndk = get(ndk);

const requested = new Map()

export async function fetchProblemEvents(id:string | undefined) {
    if (id) {
        if (!get(problemEvents).get(id) && !requested.get(id)) {
            requested.set(id, true)
            fetchEventsAndUpsertStore({ids:[id]}, problemEvents)
        }
    } else {
        consensusTipState.subscribe(state=>{
            state.Problems?.forEach(p=>{
               if (p.Head && !requested.get(id))  {
                requested.set(p.UID, true)
                // commitEventID = GetCommitEventID(p.Head)
                let filter:NDKFilter = {
                    "#e": [p.UID]
                }
                fetchEventsAndUpsertStore(filter, problemEvents)
               }
            })
        })
    }
}
//"#e": [ignitionEvent] , authors: [ignitionPubkey] kinds: allNostrocketEventKinds, "#e": [mainnetRoot]
export async function fetchEventsAndUpsertStore(filter:NDKFilter, store:Writable<Map<string, NDKEvent>>) {
    let sub = $ndk.storeSubscribe<NDKEvent>(filter, { closeOnEose: true });
      sub.subscribe(e=>{
        if (e[0]) {
            if (!get(problemEvents).get(e[0].id)) {
                problemEvents.update(state=>{
                    state.set(e[0].id, e[0])
                    return state
                })
            }
        }
      })
}

// export function GetCommitEventID(e:NDKEvent | undefined):string {
//     let val = ""
//     if (e) {
//         console.log(44)
//         e.getMatchingTags("e").forEach((t)=>{
//             if (t[t.length-1] == "commit") {
//                 if (t[1].length == 64) {
//                     val = t[1]
//                 }
//             }
//         })
//     }
//     return val
// }

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
    return val
}

var titles = new Map()

export function GetTitleFromTextEvent(e:NDKEvent | undefined):string {
    let val = ""
    let gotTitle = false
    let title = titles.get(e?.id)
    if (title) {
        if (title.length > 0) {
            titles.set(e?.id, title)
            val = title
            gotTitle = true
        }
    }
    if (e && !gotTitle) {
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

var summaries = new Map();
export function GetSummaryFromTextEvent(e:NDKEvent | undefined):string {
    let val = ""
    let gotTitle = false
    let t = summaries.get(e?.id)
    if (t) {
        if (t.length > 0) {
            summaries.set(e?.id, t)
            val = t
            gotTitle = true
        }
    }
    if (e && !gotTitle) {
        e.getMatchingTags("t").forEach((t)=>{
            if (t[t.length-1] == "summary") {
                if (t[1].length > 0) {
                    val = t[1]
                }
            }
        })
    }
    return val
}

var fulltext = new Map();
export function GetFulltextFromTextEvent(e:NDKEvent | undefined):string {
    let val = ""
    let gotTitle = false
    let t = fulltext.get(e?.id)
    if (t) {
        if (t.length > 0) {
            fulltext.set(e?.id, t)
            val = t
            gotTitle = true
        }
    }
    if (e && !gotTitle) {
        e.getMatchingTags("t").forEach((t)=>{
            if (t[t.length-1] == "full") {
                if (t[1].length > 0) {
                    val = t[1]
                }
            }
        })
    }
    return val
}