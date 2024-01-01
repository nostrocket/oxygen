import { getRocket, labelledTag } from "$lib/helpers/shouldBeInNDK";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { nostrocketIgnitionEvent } from "../../../../settings";
import { FAQ, type Nostrocket } from "../types";

export function HandleFAQEvent(
    ev: NDKEvent,
    state: Nostrocket
  ): Error | null {
    if (!state.RocketMap.get(nostrocketIgnitionEvent)?.isParticipant(ev.pubkey)) {
      return new Error("pubkey not in identity tree");
    }
    switch (ev.kind) {
      case 1122:
        if (ev.getMatchingTags("new").length > 0) {
          return handleNewFAQ(ev, state);
        }
        if (labelledTag(ev, "", "modifies")) {
          return handleModification(ev, state);
        }
    }
    return new Error("invalid event kind");
  }

function handleNewFAQ(ev: NDKEvent, state: Nostrocket): Error | null {
    let f = new FAQ()
    let question = labelledTag(ev, "question", "text")
    if (!question) {
        return new Error("could not find question")
    }
    f.Question = question
    let [rocket, err] = getRocket(ev, state)
    if (err != null) {
        return err
    }
    if (!rocket) {throw new Error("this should not happen")}
    f.RocketID = rocket.UID
    let sentence = labelledTag(ev, "sentence", "text")
    let paragraph = labelledTag(ev, "paragraph", "text")
    let page = labelledTag(ev, "page", "text")
    if (sentence) {
        f.AnswerSentence = sentence
    }
    if (paragraph) {
        f.AnswerParagraph = paragraph
    }
    if (page) {
        f.AnswerPage = page
    }
    f.CreatedBy = ev.pubkey
    f.LastUpdateUnix = ev.created_at!

    f.Events.push(ev.id)
    f.UID = ev.id;
    rocket.FAQ.set(f.UID, f)
    return null
}
function handleModification(ev: NDKEvent, state: Nostrocket): Error | null {
    return new Error("Function not implemented.");
}