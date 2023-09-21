import { currentUser } from "$lib/stores/current-user";
import { userVotepower, weHaveTheLead } from "$lib/stores/current-votepower";
import ndk from "$lib/stores/ndk";
import type { Nostrocket } from "$lib/types"
import State from "$lib/types"
import { Mutex } from "async-mutex"
import { derived, get as getStore, writable, type Readable, readable } from "svelte/store";

let r: Nostrocket = new State("{}")

export const consensusTipState = writable(r) //this is the latest nostrocket state, built from consensus events signed by participants with votepower
let changeStateMutex = new Mutex()

let eventHasCausedAStateChange = new Map; //todo use cuckoo filter instead

const $ndk = getStore(ndk);



//create a derived store that tells us when we have the consensus lead (and when we lose it)
// if currentuser && if votepower, etc.


//handle next state change event from mempool until we get one that is valid

//create consensus event

