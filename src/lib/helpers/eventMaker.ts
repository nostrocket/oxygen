import { rootTag } from "../../settings";
import { NDKEvent } from "@nostr-dev-kit/ndk";
import { get } from "svelte/store";
import { BitcoinHeightTag } from "./bitcoin";
import { unixTimeNow } from "./mundane";
import { ndk } from "$lib/stores/event_sources/relays/ndk";

export default function makeEvent(settings: eventSettings): NDKEvent {
  let _ndk = get(ndk);
  if (!_ndk.signer) {
    throw new Error("no ndk signer found");
  }
  let e = new NDKEvent(_ndk);
  e.kind = settings.kind;
  e.created_at = unixTimeNow();
  e.tags.push(rootTag);
  if (settings.rocket) {
    switch (typeof settings.rocket) {
      case "string":
        if (settings.rocket.length == 64) {
          e.tags.push(["e", settings.rocket, "", "rocket"]);
        }
        break;
      case "object":
        if (settings.rocket[1].length == 64) {
          e.tags.push(settings.rocket);
          break;
        }
    }
  }
  e.tags.push(BitcoinHeightTag());
  return e;
}

export type eventSettings = {
  kind: number;
  rocket?: string[] | string;
};

export function makeNip89HandlerEvent(){
  let _ndk = get(ndk);
  if (!_ndk.signer) {
    throw new Error("no ndk signer found");
  }
  const recommendationEvent = new NDKEvent(_ndk)
  recommendationEvent.kind = 31989
  recommendationEvent.tags = [["d","1971"],["a","31990:cc8d072efdcc676fcbac14f6cd6825edc3576e55eb786a2a975ee034a6a026cb:1699883465313","wss://relay.nostr.band","web"]]
  recommendationEvent.publish()
  .then((x) => {
      console.log(recommendationEvent.rawEvent(), x);
      // formOpen = false;
      // reset();
    })
    .catch((err) => {
      console.log(recommendationEvent);
      throw new Error("failed to publish Problem event. " + err);
    });
}
