import { labelledTag } from "$lib/helpers/shouldBeInNDK";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { rocketNameValidator } from "../../../../settings";
import type { Nostrocket } from "../types";
import { Rocket } from "../types";
import { ConsensusMode, TypeOfFailure } from "./types";
import { consensusTipState, nostrocketParticipants } from "../master_state";
import { get } from "svelte/store";

export function Handle1031(
  ev: NDKEvent,
  state: Nostrocket,
  context: Context
): Error | null {
  let err = handle1031(ev, state, context)
  if (err == null) {
    populateProblems(context.ID, state)
  }
  return err
}

function populateProblems(rocketID:string, state:Nostrocket) {
  let rocket = state.RocketMap.get(rocketID)
  if (rocket) {
    for (let [id, problem] of state.Problems) {
      if (problem.Rocket == rocketID) {
        rocket.Problems.add(id)
      }
    }
  }
}

function handle1031(
  ev: NDKEvent,
  state: Nostrocket,
  context: Context
): Error | null {
  //todo this check should be done further upstream
  if (context.ConsensusMode != ConsensusMode.FromConsensusEvent) {
    if (!get(nostrocketParticipants).includes(ev.pubkey)) {
      return new Error("pubkey is not in identity tree");
    }
  }
  let [name, err] = getRocketNameFromTags(ev);
  if (err != null) {
    return err;
  }
  if (!rocketNameValidator.test(name)) {
    //validate regex
    return new Error("invalid rocket name");
  }
  context.Name = name;
  populateMetadata(ev, context)
  if (state.RocketMap.get(ev.id)) {
    return validateAlreadyInState(ev, state, context);
  }
  if (labelledTag(ev, "rocket", "e")) {
    return modifyRocket(ev, state, context);
  }
  return createNewRocket(ev, state, context);
}

function populateMetadata(ev:NDKEvent, context:Context):void {
  context.ID = ev.id;
  context.MeritMode = labelledTag(ev, "meritmode", "metadata");
  context.Mission = labelledTag(ev, "mission", "metadata");
  let repo = labelledTag(ev, "repository", "metadata");
  if (!context.Repositories) {
    context.Repositories = new Set()
  }
  if (repo) {
    try {
      context.Repositories?.add(new URL(repo))
    }
    catch {}
  }
}

function createNewRocket(
  ev: NDKEvent,
  state: Nostrocket,
  context: Context
): Error | null {
  if (!nameIsUnique(context.Name!, state)) {
    return new Error("rocket name is not unique");
  }
  let [taggedProblemID, err] = validateTaggedProblem(ev, state, context);
  if (err != null) {
    return err;
  }
  let r = new Rocket()
  if (context.ConsensusMode == ConsensusMode.FromConsensusEvent) {
    r.RequiresConsensus = false
  }
  context.MeritMode?r.MeritMode = context.MeritMode:null;
  context.Mission?r.Mission = context.Mission:null;
  context.Repositories?r.Repositories = context.Repositories:null
  r.UID = ev.id;
  r.CreatedBy = ev.pubkey;
  r.Events.add(ev.rawEvent());
  r.Maintainers.set(ev.pubkey, []);
  if (taggedProblemID) {
    r.ProblemID = taggedProblemID;
    if (state.Problems.get(taggedProblemID)) {
      state.Problems.get(taggedProblemID)!.Rocket = r.UID;
    }
  }
  r.Name = context.Name!
  state.RocketMap.set(ev.id, r);
  return null;
}

function validateTaggedProblem(
  ev: NDKEvent,
  state: Nostrocket,
  context: Context
): [string|undefined, Error | null] {
  let taggedProblemID = labelledTag(ev, "problem", "e");
  //if we are producing a consensus event, fail hard if can't verify problem creator == this pubkey
  //if we are following a consensus event, only fail hard if problem creator is validated as someone other than this pubkey, fail soft if can't find the problem
  if (taggedProblemID) {
    if (taggedProblemID.length != 64) {
      return ["", new Error("invalid problem ID in event tags")]
    }
    let problem = state.Problems.get(taggedProblemID);
    if (context.ConsensusMode != ConsensusMode.FromConsensusEvent) {
      if (!problem) {
        return ["", new Error("could not find the tagged problem in local state")]
      }
      if (problem.CreatedBy != ev.pubkey) {
        return ["", new Error(
          "event is attempting to associate a Rocket with a problem created by a different pubkey"
        )]
      }
    }
  }
  return [taggedProblemID, null]
}

function validateAlreadyInState(
  ev: NDKEvent,
  state: Nostrocket,
  context: Context
): Error | null {
  let r: Rocket | undefined = state.RocketMap.get(ev.id);
  if (!r) {
    return new Error("could not find existing rocket");
  }
  if (context.ConsensusMode == ConsensusMode.FromConsensusEvent) {
    r.RequiresConsensus = false
  }
  state.RocketMap.set(r.UID, r)
  context.ID = r.UID
  return null;
}

function modifyRocket(
  ev: NDKEvent,
  state: Nostrocket,
  context: Context
): Error | null {
  let validChanges = 0
  let existingID = labelledTag(ev, "rocket", "e");
  let r = state.RocketMap.get(existingID!);
  if (!r) {
    return new Error("could not find a rocket with that ID");
  }
  
  if (ev.pubkey != r.CreatedBy) {
    return new Error("only the rocket creator can modify it")
  }
  let [name, err] = getRocketNameFromTags(ev)
  if (err != null) {
    return err
  }
  if (name != r.Name) {
    if (!nameIsUnique) {
      return new Error("name is taken")
    }
    r.Name = name;
    r.RequiresConsensus = true;
  }
  if (context.MeritMode != r.MeritMode) {
    if (r.MeritMode == "dictator") {
      if (context.MeritMode == "pleb") {
        r.MeritMode = "pleb"
        validChanges++
      }
    }
  }
  if (context.Mission != r.Mission) {
    r.Mission = context.Mission
    validChanges++
  }
  if (context.Repositories != r.Repositories) {
    r.Repositories = context.Repositories
    validChanges++
  }
  let [problemID, problemErr] = validateTaggedProblem(ev, state, context)
  if (problemErr != null) {
    return problemErr
  }
  if (problemID) {
    r.ProblemID = problemID
    validChanges++
  }

  if (validChanges == 0) {
    return new Error("no valid changes detected")
  }
  state.RocketMap.set(r.UID, r)
  return null;
}

export type Context = {
  ConsensusMode: ConsensusMode;
  Name?: string;
  MeritMode?:string;
  Mission?:string;
  Repositories?:Set<URL>;
  ID:string;
};

export function HandleRocketIgnitionNote(
  ev: NDKEvent,
  state: Nostrocket,
  consensusMode: ConsensusMode
): [Nostrocket, TypeOfFailure, boolean] {
  let r: Rocket | undefined = state.RocketMap.get(ev.id);
  if (!r) {
    r = new Rocket();
  }
  let newRocketName = labelledTag(ev, "name", "t");
  if (!newRocketName) {
    return [state, TypeOfFailure.HardStateFailure, false];
  }
  if (!rocketNameValidator.test(newRocketName)) {
    //validate regex
    return [state, TypeOfFailure.HardStateFailure, false];
  }
  if (
    !nameIsUnique(newRocketName, state) &&
    r.UID != ev.id &&
    consensusMode == ConsensusMode.ProvisionalScum
  ) {
    //if this is a consensus event, overwrite existing.
    //if this is not a consensus event, fail.
    return [state, TypeOfFailure.HardStateFailure, false];
  }

  if (
    !get(nostrocketParticipants).includes(ev.pubkey) &&
    consensusMode != ConsensusMode.Scum &&
    consensusMode != ConsensusMode.ProvisionalScum
  ) {
    return [state, TypeOfFailure.SoftStateFailure, false];
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
  if (consensusMode == ConsensusMode.ProvisionalScum) {
    r.RequiresConsensus = true;
  }
  r.UID = ev.id;
  r.CreatedBy = ev.pubkey;
  r.Events.add(ev.rawEvent());
  r.Maintainers.set(ev.pubkey, []);
  if (taggedProblemID) {
    r.ProblemID = taggedProblemID;
    if (state.Problems.get(taggedProblemID)) {
      state.Problems.get(taggedProblemID)!.Rocket = r.UID;
    }
  }
  r.Name = newRocketName;
  state.RocketMap.set(ev.id, r);
  return [state, 0, true];
}

export function nameIsUnique(name: string, state?: Nostrocket): boolean {
  if (!name) {
    return false
  }
  if (!state) {
    state = get(consensusTipState);
  }
  for (let [s, r] of state.RocketMap) {
    if (r.Name.toLowerCase() == name?.toLowerCase()) {
      return false;
    }
  }
  return true;
}

function getRocketNameFromTags(ev: NDKEvent): [string, Error | null] {
  let newRocketName = labelledTag(ev, "name", "t");
  if (!newRocketName) {
    newRocketName = labelledTag(ev, "name", "text");
  }
  if (!newRocketName) {
    newRocketName = labelledTag(ev, "name", "metadata");
  }
  if (!newRocketName) {
    return ["", new Error("could not find rocket name in tags")];
  }
  return [newRocketName, null];
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
