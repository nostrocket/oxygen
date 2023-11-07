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
    event?.getMatchingTags(t).forEach((tag) => {
      if (tag[tag.length - 1] == label) {
        r = tag[1];
      }
    });
    
    if (!r && label.length == 0) {
      let fallback:string[] = []
      event?.getMatchingTags(t).forEach((tag) => {
        fallback.push(tag[1])
      }
    )
    if (fallback.length == 1) {
        r = fallback[0]
    }
  }
    return r;
  }