import {
  consensusTipState,
  eventsInState,
  labelledTag,
  mempool,
} from "$lib/consensus/state";
import { weHaveTheLead } from "$lib/consensus/votepower";
import { BitcoinTipHeight } from "$lib/helpers/bitcoin";
import makeEvent from "$lib/helpers/eventMaker";
import { unixTimeNow } from "$lib/helpers/mundane";
import { validate } from "$lib/protocol_validators/rockets";
import { ndk } from "$lib/stores/event_sources/relays/ndk";
import {
  MAX_STATECHANGE_EVENT_AGE,
  rootEventID,
  simulate
} from "../../settings";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { Mutex } from "async-mutex";
import { get, get as getStore, writable } from "svelte/store";

const $ndk = getStore(ndk);

const eventHasCausedAStateChange = new Map(); //todo use cuckoo filter instead

export const HEAD = writable<string>(rootEventID); //todo update whenever we handle or publish a consensus event

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
function processAllMempool() {
  let bitcoinTip = BitcoinTipHeight();
  //todo publish a replaceable event with our current HEAD ID and height and validate that we are appending to this so that we do not publish extra consensus events
  mempool.stateChangeEvents().forEach((event: NDKEvent) => {
    if (!eventsInState.fetch(event.id)) {
      if (event.created_at) {
        if (unixTimeNow() - event.created_at < MAX_STATECHANGE_EVENT_AGE) {
          if (labelledTag(event, "root", "e") == rootEventID)
            mutex.acquire().then(() => {
              console.log("mutex lock " + event.id);
              let tipState = get(consensusTipState);
              if (validate(event, tipState)) {
                //todo: copy current state instead, and update it with each event, then discard when consensus catches up
                //create and publish a consesnsus event linked to our current HEAD
                let consensusHeight: number = tipState.ConsensusEvents.length; //0 indexed so we don't need to ++
                publishStateChangeEvent(
                  event,
                  tipState.LastConsensusEvent(),
                  bitcoinTip.height,
                  consensusHeight
                )
                  .then((e) => {
                    console.log("consensus event created");
                  })
                  .catch((err) => console.log(err))
                  .finally(() => {
                    //wait for the event to enter our current state (observer on eventHasCausedAStateChange pool)
                    mutex.release;
                    console.log("mutex unlock");
                  });
              }
            });
        }
      }
    }
  });
}

async function publishStateChangeEvent(
  event: NDKEvent,
  head: string,
  bitcoinHeight: number,
  consensusHeight: number
): Promise<NDKEvent> {
  let p = new Promise<NDKEvent>((resolve, reject) => {
    let e = makeEvent({kind:15172008})
    e.tags.push(["e", event.id, "", "request"]);
    e.tags.push(["e", head, "", "previous"]);
    if (!simulate) {
      e.publish()
        .then((x) => {
          console.log("published to:", x);
          resolve(e);
        })
        .catch(() => {
          console.log("failed to publish");
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
}

//watch mempool and process each event as it comes in, if we have the lead
