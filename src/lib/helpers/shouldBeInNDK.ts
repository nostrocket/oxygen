import type { Block } from "$lib/stores/nostrocket_state/types";
import { NDKEvent } from "@nostr-dev-kit/ndk";

export function labelledTag(
  event: NDKEvent,
  label: string,
  type: string | undefined
): string | undefined {
  let r: string | undefined = undefined;
  let t = "e";
  if (type) {
    t = type;
  }
  for (let tag of event?.getMatchingTags(t)) {
    if (tag[tag.length - 1] == label || label.length == 0) {
      r = tag[1];
    }
  }

  if (!r && label.length == 0) {
    let fallback: string[] = [];
    for (let tag of event?.getMatchingTags(t)) {
      fallback.push(tag[1]);
    }
    if (fallback.length == 1) {
      r = fallback[0];
    }
  }
  return r;
}

export function labelledTagSet(
  event: NDKEvent,
  label: string,
  type: string | undefined
):Set<string>|null {
  let s = new Set<string>()
  let t = "e";
  if (type) {
    t = type;
  }
  for (let tag of event?.getMatchingTags(t)) {
    if (tag[tag.length - 1] == label) {
      s.add(tag[1])
    }
  }
  if (label.length == 0) {
    for (let tag of event?.getMatchingTags(t)) {
      s.add(tag[1]);
    }
  }
  if (s.size > 0) {
    return s  
  }
  return null
}

export function getBlock(ev:NDKEvent):[Block | undefined, null | Error] {
  let bitcoin = labelledTag(ev, "", "bitcoin")
  if (!bitcoin) {
    return [undefined, new Error("could not find a Bitcoin tag")]
  }
  let blockdata = bitcoin.split(':')
  let height = parseInt(blockdata[0], 10)
  let hash = blockdata[1]
  let timestamp = blockdata [2]
  if (!height) {return [undefined, new Error("could not find block height")]}
  if (hash.length != 64) {return [undefined, new Error("could not find block hash")]}
  let block:Block = {height:height, hash:hash}
  if (timestamp) {
    block.timestamp = parseInt(timestamp, 10)
  }
  return [block, null]
}

export function getAmount(ev:NDKEvent):[number, Error | null] {
  let amount = labelledTag(ev, "", "amount")
  if (!amount) {return [0, new Error("could not find an amount")]}
  let intAmount = parseInt(amount, 10)
  return [intAmount, null]
}

export function getEmbeddedEvent(ev: NDKEvent): NDKEvent | undefined {
  let eventAsJson = ev.getMatchingTags("event");
  let n = new NDKEvent();
  let parsed = JSON.parse(eventAsJson[0][1]);
  n.content = parsed.content;
  n.created_at = parsed.created_at;
  n.tags = parsed.tags;
  n.kind = parsed.kind;
  n.pubkey = parsed.pubkey;
  n.id = parsed.id;
  n.sig = parsed.sig;
  return n;
}