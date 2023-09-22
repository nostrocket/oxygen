import { currentUser } from "$lib/stores/current-user";
import { userVotepower, weHaveTheLead } from "$lib/consensus/current-votepower";
import ndk from "$lib/stores/ndk";
import type { Nostrocket } from "$lib/types"
import State from "$lib/types"
import { Mutex } from "async-mutex"
import { derived, get as getStore, writable, type Readable, readable } from "svelte/store";

const $ndk = getStore(ndk);

let r: Nostrocket = new State("{}")

export const consensusTipState = writable(r) //this is the latest nostrocket state, built from consensus events signed by participants with votepower
let changeStateMutex = new Mutex()

consensusTipState.subscribe((x)=>{
    console.log(x)
})

let eventHasCausedAStateChange = new Map; //todo use cuckoo filter instead

weHaveTheLead.subscribe((weHaveIt)=>{
    if (weHaveIt) {
        console.log(weHaveIt)
//handle next state change event from mempool until we get one that is valid

//create consensus event
    }
})




