import type { NDKEvent } from "@nostr-dev-kit/ndk";
import {
  Merit,
  type Block,
  type Nostrocket,
  type Problem,
  type Rocket,
} from "../types";
import { ConsensusMode } from "./types";
import { getAmount, getBlock, labelledTag } from "$lib/helpers/shouldBeInNDK";
import validate from "bitcoin-address-validation";

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
  problem?: Problem;
  amount: number;
  block: Block;
  onchain: string;
  lud16: string;
  ID?: string;
  rocket: Rocket;
  exists: boolean;
};

function handle1602(
  ev: NDKEvent,
  state: Nostrocket,
  context: Context
): Error | null {
    let err = populateContext(ev, state, context)
    if (err != null) {
        return err
    }
    console.log(context)
    return null
}

function populateContext(
  ev: NDKEvent,
  state: Nostrocket,
  context: Context
): Error | null {
  let rocketID = labelledTag(ev, "rocket", "e");
  if (!rocketID) {
    return new Error("could not find a rocket ID");
  }

  let rocket = state.RocketMap.get(rocketID);
  if (!rocket) {
    return new Error("could not find this rocket in our current state");
  }
  let existing = rocket.Merits.get(ev.id);

  if (
    existing &&
    context.ConsensusMode != ConsensusMode.FromConsensusEvent &&
    context.ConsensusMode != ConsensusMode.Producer
  ) {
    return new Error("this merit request already exists");
  } else {
    context.exists = true;
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
  if (problem) {
    context.problem = problem;
  }
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
