import { userVotepower, weHaveTheLead } from "$lib/consensus/current-votepower";
import { BitcoinTipHeight } from "$lib/helpers/bitcoin";
import { unixTimeNow } from "$lib/helpers/mundane";
import { validate } from "$lib/protocol_validators/rockets";
import { mainnetRoot, rootTag, simulate } from "$lib/settings";
import { currentUser } from "$lib/stores/current-user";
import ndk from "$lib/stores/ndk";
import { consensusTipState, eventsInState, mempool } from "$lib/stores/state";
import type { Nostrocket } from "$lib/types";
import State from "$lib/types";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { Mutex } from "async-mutex";
import {
  derived,
  get as getStore,
  writable,
  type Readable,
  readable,
  get,
} from "svelte/store";

const $ndk = getStore(ndk);

const eventHasCausedAStateChange = new Map(); //todo use cuckoo filter instead

export const HEAD = writable<string>(mainnetRoot); //todo update whenever we handle or publish a consensus event

export async function processMempool(): Promise<void> {
  weHaveTheLead.subscribe((weHaveIt) => {
    if (weHaveIt) {
      console.log("we have consensus lead");
      processAllMempool();
      //handle next state change event from mempool until we get one that is valid

      //create consensus event
    }
  });
}
let mutex = new Mutex();
//process all possible mempool events
let processAllMempool = function () {
  let bitcoinHeight: number = BitcoinTipHeight();
  //todo publish a replaceable event with our current HEAD ID and height and validate that we are appending to this so that we do not publish extra consensus events
  mempool.singleIterator().forEach((event) => {
    if (!eventsInState.fetch(event.id)) {
      let tipState = get(consensusTipState);
      mutex.acquire().then(() => {
        if (validate(event, tipState)) {
          //todo: copy current state instead, and update it with each event, then discard when consensus catches up
          //create and publish a consesnsus event linked to our current HEAD
          let consensusHeight: number = tipState.ConsensusEvents.length; //0 indexed so we don't need to ++
          publishStateChangeEvent(
            event,
            tipState.LastConsensusEvent(),
            bitcoinHeight,
            consensusHeight
          )
            .then((e) => {
              console.log("consensus event created");
            })
            .catch((err) => console.log(err))
            .finally(() => {
              //wait for the event to enter our current state (observer on eventHasCausedAStateChange pool)
              mutex.release;
            });
        }
      });
    }
  });
};

let publishStateChangeEvent = async function (
  event: NDKEvent,
  head: string,
  bitcoinHeight: number,
  consensusHeight: number
): Promise<NDKEvent> {
  let p = new Promise<NDKEvent>((resolve, reject) => {
    let e = new NDKEvent($ndk);
    e.kind = 15172008;
    e.created_at = unixTimeNow();
    e.tags.push(rootTag);
    e.tags.push(["e", event.id, "", "request"]);
    e.tags.push(["e", head, "", "previous"]);
    e.tags.push([
      "h",
      bitcoinHeight.toString() + ":" + consensusHeight.toString(),
    ]);
    if (!simulate) {
      e.publish()
        .then((x) => {
          console.log("published to:", x);
          resolve(e);
        })
        .catch(() => {
          alert("failed to publish");
          reject("failed to publish");
        });
    } else {
      e.sign().then(() => {
        console.log("simulation mode, not publishing");
        console.log(e.rawEvent());
        resolve(e);
      });
    }
  });
  return p;
};

//watch mempool and process each event as it comes in, if we have the lead
