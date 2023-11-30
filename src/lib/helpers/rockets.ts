import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { nostrocketIgnitionEvent } from "../../settings";
import makeEvent from "./eventMaker";
import type { Rocket } from "$lib/stores/nostrocket_state/types";

export function Create1031FromRocket(rocketToPublish:Rocket):NDKEvent {
    let e = makeEvent({ kind: 1031 });
    e.tags.push(["metadata", rocketToPublish.Name, "name"]);
    if (rocketToPublish.ProblemID) {
      e.tags.push(["e", rocketToPublish.ProblemID, "problem"]);
    }
    if (rocketToPublish.MeritMode) {
      e.tags.push(["metadata", rocketToPublish.MeritMode, "meritmode"]);
    }
    if (rocketToPublish.Mission) {
      e.tags.push(["metadata", rocketToPublish.Mission, "mission"]);
    }
    for (let url of rocketToPublish.Repositories) {
      e.tags.push(["metadata", url.toString(), "repository"]);
    }
    if (rocketToPublish.UID) {
      e.tags.push(["e", rocketToPublish.UID, "rocket"]);
    }
    e.tags.push(["e", nostrocketIgnitionEvent, "parent"]);
    return e
}