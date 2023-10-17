import { rootTag } from "$lib/settings";
import ndk from "$lib/stores/events/ndk";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { get } from "svelte/store";
import { BitcoinHeightTag } from "./bitcoin";
import { unixTimeNow } from "./mundane";

export default function makeEvent(
  kind: number,
  rocketTag: string[] | undefined
): NDKEvent {
  let _ndk = get(ndk);
  if (!_ndk.signer) {
    throw new Error("no ndk signer found");
  }
  let e = new NDKEvent(_ndk);
  e.kind = kind;
  e.created_at = unixTimeNow();
  e.tags.push(rootTag);
  rocketTag ? e.tags.push(rocketTag) : null;
  //e.tags.push(["d", nostrocketIgnitionEvent]);
  e.tags.push(BitcoinHeightTag());
  return e;
}
