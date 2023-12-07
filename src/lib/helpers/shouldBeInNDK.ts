import type { NDKEvent } from "@nostr-dev-kit/ndk";

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
    if (tag[tag.length - 1] == label) {
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
