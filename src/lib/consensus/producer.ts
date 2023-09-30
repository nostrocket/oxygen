import { currentUser } from "$lib/stores/current-user";
import { userVotepower, weHaveTheLead } from "$lib/consensus/current-votepower";
import ndk from "$lib/stores/ndk";
import type { Nostrocket } from "$lib/types"
import State from "$lib/types"
import { Mutex } from "async-mutex"
import { derived, get as getStore, writable, type Readable, readable, get } from "svelte/store";
import { mempool } from "$lib/stores/state";
import { validate } from "$lib/protocol_validators/rockets";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { unixTimeNow } from "$lib/helpers/mundane";
import { ignitionEvent, ignitionTag, simulate } from "$lib/settings";

const $ndk = getStore(ndk);

const eventHasCausedAStateChange = new Map; //todo use cuckoo filter instead

export const HEAD = writable<string>(ignitionEvent) //todo update whenever we handle or publish a consensus event


export async function processMempool():Promise<void> {

weHaveTheLead.subscribe((weHaveIt)=>{
    if (weHaveIt) {
        console.log("we have consensus lead")
        processAllMempool()
        //handle next state change event from mempool until we get one that is valid
        
//create consensus event
    }
})
}
let mutex = new Mutex
//process all possible mempool events
let processAllMempool = function() {
        mempool.singleIterator().forEach(event => {
            mutex.acquire().then(()=>{
            console.log(37)
            if (validate(event)) {
                console.log(39)
                //create and publish a consesnsus event linked to our current HEAD
                publishStateChangeEvent(event, get(HEAD)).then((e)=>{
                    HEAD.set(e.id)
                }).catch((err)=>console.log(err)).finally(()=>{
                    //wait for the event to enter our current state (observer eventHasCausedAStateChange pool)
                    mutex.release
                })
            }
        });
    })
}

let publishStateChangeEvent = async function(event: NDKEvent, head: string):Promise<NDKEvent> {
    let p = new Promise<NDKEvent>((resolve, reject) => {
        let e = new NDKEvent($ndk)
        e.kind = 15172008;
        e.created_at = unixTimeNow()
        e.tags.push(ignitionTag)
        e.tags.push(["e", event.id, "", "request"])
        e.tags.push(["e", head, "", "previous"])
        if (!simulate) {
            e.publish().then(x=>{
            console.log("published to:", x)
            resolve(e)
        }).catch(()=>{alert("failed to publish"); reject("failed to publish")})
        } else {
            e.sign().then(()=>{
                console.log("simulation mode, not publishing")
                resolve(e)
            })
        }
      });
      return p

}


//watch mempool and process each event as it comes in, if we have the lead

