import {
  getAmount,
  getBlock,
  getRocket,
  labelledTag,
} from "$lib/helpers/shouldBeInNDK";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import validate from "bitcoin-address-validation";
import { Merit, type Block, type Nostrocket, type Rocket } from "../types";
import { ConsensusMode } from "./types";

export function Handle1602(
  ev: NDKEvent,
  state: Nostrocket,
  context: Context
): Error | null {
  let err = handle1602(ev, state, context);
  if (err != null) {
    console.log(err);
  }
  if (err == null) {
    //post-handling calls
  }
  return err;
}

type Context = {
  ConsensusMode: ConsensusMode;
  problem?: string;
  amount?: number;
  block?: Block;
  onchain?: string;
  lud16?: string;
  ID?: string;
  rocket?: Rocket;
  existing?: Merit;
};

function handle1602(
  ev: NDKEvent,
  state: Nostrocket,
  context: Context
): Error | null {
  let err = populateContext1602(ev, state, context);
  if (err != null) {
    return err;
  }
  let merit = new Merit();
  if (
    context.existing &&
    context.ConsensusMode == ConsensusMode.FromConsensusEvent
  ) {
    merit = context.existing;
    merit.RequiresConsensusPop(ev);
  } else {
    merit.RocketID = context.rocket!.UID;
    merit.Amount = context.amount!;
    merit.CreatedAt = context.block!;
    merit.CreatedBy = ev.pubkey;
    merit.Problem = context.problem!;
    merit.UID = ev.id;
    merit.Events.add(ev.id);
    merit.RequiresConsensusPush(ev);
  }

  context.rocket!.Merits.set(ev.id, merit);
  return null;
}

function populateContext1602(
  ev: NDKEvent,
  state: Nostrocket,
  context: Context
): Error | null {
  let [rocket, errRocket] = getRocket(ev, state);
  if (errRocket != null) {
    return errRocket;
  }
  let existing = rocket!.Merits.get(ev.id);
  if (
    existing &&
    context.ConsensusMode != ConsensusMode.FromConsensusEvent
    //todo: this should be based on the permille of votepower that has signed, not just consensusmode
  ) {
    return new Error("this merit request already exists");
  } else {
    context.existing = existing;
  }
  context.rocket = rocket;
  let problemID = labelledTag(ev, "problem", "e");
  if (!problemID) {
    return new Error("could not find a problem tag in this event");
  }
  let problem = state.Problems.get(problemID);

  if (context.ConsensusMode != ConsensusMode.FromConsensusEvent) {
    if (!problem) {
      return new Error("could not find this problem in our current state");
    }
    if (problem.Status != "closed") {
      return new Error("this problem is not closed");
    }
    if (problem.ClaimedBy != ev.pubkey) {
      return new Error(
        "this problem was not solved by the same pubkey as this merit request"
      );
    }
  }
  context.problem = problemID;

  let [block, err] = getBlock(ev);
  if (err != null) {
    return err;
  }
  context.block = block!;
  let [amount, errAmount] = getAmount(ev);
  if (errAmount != null) {
    return errAmount;
  }
  context.amount = amount;

  let onchain = labelledTag(ev, "", "onchain");
  if (onchain) {
    if (!validate(onchain)) {
      return new Error("invalid Bitcoin address");
    } else {
      context.onchain = onchain;
    }
  }

  let zap = ev.getMatchingTags("zap");
  if (zap.length > 0) {
    throw new Error("IMPLEMENT ME!");
  }
  return null;
}

export function Handle1603(
  ev: NDKEvent,
  state: Nostrocket,
  context: Context
): Error | null {
  let err = handle1603(ev, state, context);
  if (err != null) {
    err.cause = ev.id;
    return err;
  }
  if (err == null) {
    //post-handling calls
  }
  return err;
}

function handle1603(
  ev: NDKEvent,
  state: Nostrocket,
  context: Context
): Error | null {
  let [rocket, errRocket] = getRocket(ev, state);
  if (errRocket != null) {
    return errRocket;
  }

  if (rocket!.currentVotepowerForPubkey(ev.pubkey) == 0) {
    return new Error("pubkey has no votepower");
  }
  //note: when handling consensus events, we check that the event is new (within MAX_STATECHANGE_EVENT_AGE)
  let meritID = labelledTag(ev, "merit", "e");
  if (!meritID) {
    return new Error("could not find Merit Request ID");
  }
  let existing = rocket!.Merits.get(meritID);
  if (!existing) {
    return new Error("could not find existing Merit Request");
  }
  if (existing.Events.has(ev.id)) {
    if (context.ConsensusMode == ConsensusMode.FromConsensusEvent) {
      existing.RequiresConsensusPop(ev);
    } else {
      return new Error("already have this event");
    }
  } else {
    let direction = labelledTag(ev, "", "vote");
    if (!direction) {
      return new Error("could not find vote direction");
    }
    if (direction == "ratify") {
      existing.Ratifiers.add(ev.pubkey);
    }
    if (direction == "blackball") {
      existing.Blackballers.add(ev.pubkey);
    }
    existing.RatifyPermille = 0;
    for (let ratifier of existing.Ratifiers) {
      existing.RatifyPermille += rocket!.currentVotepowerForPubkey(ratifier);
    }
    existing.RatifyPermille =
      (existing.RatifyPermille / rocket!.currentTotalVotepower()) * 1000;

    existing.BlackballPermille = 0;
    for (let blackballer of existing.Blackballers) {
      existing.BlackballPermille += rocket!.currentVotepowerForPubkey(blackballer);
    }
    existing.BlackballPermille =
      (existing.BlackballPermille / rocket!.currentTotalVotepower()) * 1000;
    existing.Events.add(ev.id);
    existing.RequiresConsensusPush(ev);
  }

  if (existing.RatifyPermille == 1000) {
    existing.Ratified = true
    existing.Blackballed = false
  }
  if (existing.BlackballPermille > 0) {
    existing.Blackballed = true
    existing.Ratified = false
  }
  rocket!.Merits.set(existing.UID, existing);
  state.RocketMap.set(rocket!.UID, rocket!);
  //todo: if fully ratified, then what?
  return null;
}
