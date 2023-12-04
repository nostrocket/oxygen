import { weHaveTheLead } from "$lib/consensus/votepower";
import { BitcoinTipHeight } from "$lib/helpers/bitcoin";
import makeEvent from "$lib/helpers/eventMaker";
import { unixTimeNow } from "$lib/helpers/mundane";
import { labelledTag } from "$lib/helpers/shouldBeInNDK";
import { HandleHardStateChangeRequest } from "$lib/stores/nostrocket_state/hard_state/handler";
import { ConsensusMode } from "$lib/stores/nostrocket_state/hard_state/types";
import {
  consensusTipState,
  stateChangeEvents
} from "$lib/stores/nostrocket_state/master_state";
import { changeStateMutex } from "$lib/stores/nostrocket_state/mutex";
import type { Nostrocket } from "$lib/stores/nostrocket_state/types";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { get, writable } from "svelte/store";
import {
  MAX_STATECHANGE_EVENT_AGE,
  rootEventID,
  simulateEvents,
} from "../../settings";

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
//process all possible mempool events
function processAllMempool(state: Nostrocket) {
  let bitcoinTip = BitcoinTipHeight();
  let tipState = get(consensusTipState)
  let previous = tipState.LastConsensusEvent()
  let success = false
  //todo publish a replaceable event with our current HEAD ID and height and validate that we are appending to this so that we do not publish extra consensus events
  for (let ev of get(stateChangeEvents)) {
    if (ev.created_at) {
      if (true) {//(unixTimeNow() - ev.created_at < MAX_STATECHANGE_EVENT_AGE) {
        if (labelledTag(ev, "root", "e") == rootEventID)
          changeStateMutex(ev.id).then((release) => {
            console.log("mutex lock " + ev.id);
            //let tipState = get(consensusTipState).Copy();
            if (!success) {
              if (HandleHardStateChangeRequest(ev, tipState, ConsensusMode.Producer) == null) {
                console.log(53, ev.id)
                success = true
                //todo: copy current state instead, and update it with each event, then discard when consensus catches up
                let consensusHeight: number = tipState.ConsensusEvents.length; //0 indexed so we don't need to ++
                publishConsensusEvent(
                  ev,
                  previous,
                  bitcoinTip.height,
                  consensusHeight
                )
                  .then((e) => {
                    console.log("consensus event created");
                  })
                  .catch((err) => console.log(err));
              }
            }
            release();
          });
      }
    }
  }
}

async function publishConsensusEvent(
  event: NDKEvent,
  head: string,
  bitcoinHeight: number,
  consensusHeight: number
): Promise<NDKEvent> {
  let p = new Promise<NDKEvent>((resolve, reject) => {
    let e = makeEvent({ kind: 15172008 });
    e.tags.push(["e", event.id, "", "request"]);
    e.tags.push(["event", JSON.stringify(event.rawEvent())])
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
