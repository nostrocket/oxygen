import { weHaveTheLead } from "$lib/consensus/votepower";
import { BitcoinTipHeight } from "$lib/helpers/bitcoin";
import makeEvent from "$lib/helpers/eventMaker";
import { unixTimeNow } from "$lib/helpers/mundane";
import { labelledTag } from "$lib/helpers/shouldBeInNDK";
import { validate } from "$lib/protocol_validators/rockets";
import { ndk } from "$lib/stores/event_sources/relays/ndk";
import {
  HandleHardStateChangeEvent,
  consensusTipState,
  stateChangeEvents,
} from "$lib/stores/nostrocket_state/master_state";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { Mutex } from "async-mutex";
import { get, get as getStore, writable } from "svelte/store";
import {
  MAX_STATECHANGE_EVENT_AGE,
  rootEventID,
  simulateEvents,
} from "../../settings";
import type { Nostrocket } from "$lib/stores/nostrocket_state/types";
import { changeStateMutex } from "$lib/stores/nostrocket_state/mutex";

const eventHasCausedAStateChange = new Map(); //todo use cuckoo filter instead

export const HEAD = writable<string>(rootEventID); //todo update whenever we handle or publish a consensus event

export async function startProcessingMempoolWithConsensusLead(): Promise<void> {
  weHaveTheLead.subscribe((weHaveIt) => {
    if (weHaveIt) {
      console.log("we have consensus lead");
      processAllMempool(get(consensusTipState).Copy());
      //handle next state change event from mempool until we get one that is valid

      //create consensus event
    }
  });
}
let mutex = new Mutex();
//process all possible mempool events
function processAllMempool(state: Nostrocket) {
  let bitcoinTip = BitcoinTipHeight();
  //todo publish a replaceable event with our current HEAD ID and height and validate that we are appending to this so that we do not publish extra consensus events
  get(stateChangeEvents).forEach((ev: NDKEvent) => {
    if (ev.created_at) {
      if (unixTimeNow() - ev.created_at < MAX_STATECHANGE_EVENT_AGE) {
        if (labelledTag(ev, "root", "e") == rootEventID)
          changeStateMutex(ev.id).then((release) => {
            console.log("mutex lock " + ev.id);
            let tipState = get(consensusTipState).Copy();
            if (HandleHardStateChangeEvent(ev, tipState)) {
              //todo: copy current state instead, and update it with each event, then discard when consensus catches up
              //create and publish a consesnsus event linked to our current HEAD
              let consensusHeight: number = tipState.ConsensusEvents.length; //0 indexed so we don't need to ++
              publishStateChangeEvent(
                ev,
                tipState.LastConsensusEvent(),
                bitcoinTip.height,
                consensusHeight
              )
                .then((e) => {
                  console.log("consensus event created");
                })
                .catch((err) => console.log(err));
            }
            release();
          });
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
    let e = makeEvent({ kind: 15172008 });
    e.tags.push(["e", event.id, "", "request"]);
    e.tags.push(["e", head, "", "previous"]);
    if (!simulateEvents) {
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
