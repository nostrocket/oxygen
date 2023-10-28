import { derived } from "svelte/store";
import { consensusTipState } from "../master_state";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { labelledTag } from "$lib/helpers/shouldBeInNDK";
import { rocketNameValidator } from "../../../../settings";
import type { Nostrocket } from "../types";
import {Rocket} from "../types"

export const Rockets = derived(consensusTipState, ($nr) => {
    return $nr.RocketMap;
  });

  //kind 15171031
  function HandleRocketIgnitionNote(ev:NDKEvent, state: Nostrocket, consensusMode: ConsensusMode): [Nostrocket, TypeOfFailure, boolean] {
    let newRocketName = labelledTag(ev, "name", "t")
    if (!newRocketName) {return [state, TypeOfFailure.HardStateFailure, false];}
    if (!rocketNameValidator.test(newRocketName)) {
      //validate regex
      return [state, TypeOfFailure.HardStateFailure, false];
    }
    if (!nameIsUnique(newRocketName, state)) {
      return [state, TypeOfFailure.HardStateFailure, false];
    }
    let taggedProblemID = labelledTag(ev, "problem", "e")
    //if we are producing a consensus event, fail hard if can't verify problem creator == this pubkey
    //if we are following a consensus event, only fail hard if problem creator is validated as someone other than this pubkey, fail soft if can't find the problem
    if (taggedProblemID) {
      if (taggedProblemID.length != 64) {
        //problem tag is optional, but MUST be valid if defined
        return [state, TypeOfFailure.HardStateFailure, false];
      }
      let problem = state.Problems.get(taggedProblemID)
      if (!problem && consensusMode == ConsensusMode.Producer) {
        return [state, TypeOfFailure.HardStateFailure, false];
      }
      if (problem) {
        if (problem.CreatedBy != ev.pubkey) {
          //if we have this problem locally, and it isn't created by the same pubkey as this event
          return [state, TypeOfFailure.HardStateFailure, false];
        }
      }
    }
    let r = new Rocket()
    r.CreatedBy = ev.pubkey;
    r.Event = ev;
    r.Maintainers.set(ev.pubkey, [])
    if (taggedProblemID) {r.ProblemID = taggedProblemID}
    r.Name = newRocketName
    state.RocketMap.set(ev.id, r)
    return [state, 0, true]
  }


  export function nameIsUnique(name: string, state: Nostrocket): boolean {
    //validate that name doesn't already exist
    let unique = true
    state.RocketMap.forEach((r) => {
      if (r.Name.toLowerCase() == name.toLowerCase()) {
        unique = false
      }
    });
    return unique;
  }

  export enum TypeOfFailure {
    HardStateFailure = 0, //halt and catch fire
    SoftStateFailure = 1, //we can usually continue 
  }

  enum ConsensusMode {
    Producer = 0, //we have votepower and are attempting to add an event to consensus state
    FollowerWithVotepower = 1, //we have votepower but we won't sign someone else's consensus event unless we can validate it
    Scum = 2, //Just trust the votepower for now, and maybe roll things back if we need to
  }