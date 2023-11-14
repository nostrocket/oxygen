import { labelledTag } from "$lib/helpers/shouldBeInNDK";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { rocketNameValidator } from "../../../../settings";
import type { Nostrocket } from "../types";
import { Rocket } from "../types";
import { ConsensusMode, TypeOfFailure } from "./types";
import { consensusTipState, nostrocketParticipants } from "../master_state";
import { get } from "svelte/store";

//kind 15171031
export function HandleRocketIgnitionNote(
  ev: NDKEvent,
  state: Nostrocket,
  consensusMode: ConsensusMode
): [Nostrocket, TypeOfFailure, boolean] {
  if (!get(nostrocketParticipants).includes(ev.pubkey) && consensusMode != ConsensusMode.Scum) {
    return [state, TypeOfFailure.SoftStateFailure, false]
  }
  let newRocketName = labelledTag(ev, "name", "t");
  if (!newRocketName) {
    return [state, TypeOfFailure.HardStateFailure, false];
  }
  if (!rocketNameValidator.test(newRocketName)) {
    //validate regex
    return [state, TypeOfFailure.HardStateFailure, false];
  }
  if (!nameIsUnique(newRocketName, state)) {
    return [state, TypeOfFailure.HardStateFailure, false];
  }
  let taggedProblemID = labelledTag(ev, "problem", "e");
  //if we are producing a consensus event, fail hard if can't verify problem creator == this pubkey
  //if we are following a consensus event, only fail hard if problem creator is validated as someone other than this pubkey, fail soft if can't find the problem
  if (taggedProblemID) {
    if (taggedProblemID.length != 64) {
      //problem tag is optional, but MUST be valid if defined
      return [state, TypeOfFailure.HardStateFailure, false];
    }
    let problem = state.Problems.get(taggedProblemID);
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
  let r = new Rocket();
  r.UID = ev.id;
  r.CreatedBy = ev.pubkey;
  r.Event = ev.rawEvent();
  r.Maintainers.set(ev.pubkey, []);
  if (taggedProblemID) {
    r.ProblemID = taggedProblemID;
    if(state.Problems.get(taggedProblemID)){
      state.Problems.get(taggedProblemID)!.Rocket = r.UID
  }}
  r.Name = newRocketName;
  state.RocketMap.set(ev.id, r);
  return [state, 0, true];
}

export function nameIsUnique(name: string, state?: Nostrocket): boolean {
  if (!state) {
    state = get(consensusTipState);
  }
  for (let [s, r] of state.RocketMap) {
    if (r.Name.toLowerCase() == name.toLowerCase()) {
      return false
    }
  }
  return true;
}

////Legacy stuff, leave here for G to delete
// function rocketIgnitionEvent(
//   ev: NDKEvent,
//   state: Nostrocket
// ): [Nostrocket, boolean] {
//   //todo valide identity tree etc
//   let nameTag = ev.getMatchingTags("n")[0];
//   if (nameTag) {
//     let name = nameTag[1];
//     if (name) {
//       //validate regex
//       if (!rocketNameValidator.test(name)) {
//         return [state, false];
//       }
//       if (!nameIsUnique(name, state)) {
//         return [state, false];
//       }
//       let r: Rocket = new Rocket();
//       let problem = ev.getMatchingTags("a")[0];
//       let problemStr: string | undefined;
//       if (problem) {
//         if (problem[1]) {
//           let [id, pubkey, dtag] = problem[1].split(":");
//           if (id && pubkey && dtag) {
//             if (pubkey !== ev.pubkey) {
//               console.log(
//                 ev.pubkey +
//                   " is attempting to create a rocket based on a problem logged by " +
//                   pubkey
//               );
//               return [state, false];
//             }
//             problemStr = problem[1];
//           }
//         }
//       }
//       r.fromEvent(ev, name, problemStr);
//       state.RocketMap.set(r.UID, r);
//       return [state, true];
//     }
//   }
//   return [state, false];
// }
