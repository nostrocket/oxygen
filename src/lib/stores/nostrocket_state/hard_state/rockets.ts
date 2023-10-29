import { labelledTag } from "$lib/helpers/shouldBeInNDK";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { rocketNameValidator } from "../../../../settings";
import type { Nostrocket } from "../types";
import { Rocket } from "../types";
import { ConsensusMode, TypeOfFailure } from "./types";

  //kind 15171031
  export function HandleRocketIgnitionNote(ev:NDKEvent, state: Nostrocket, consensusMode: ConsensusMode): [Nostrocket, TypeOfFailure, boolean] {
    let newRocketName = labelledTag(ev, "name", "t")
    console.log(newRocketName)
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
    r.UID = ev.id;
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

