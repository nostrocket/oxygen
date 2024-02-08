import { getRocketFromEvent, labelledTag } from "$lib/helpers/shouldBeInNDK";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { nostrocketIgnitionEvent } from "../../../../settings";
import { FAQ, type Nostrocket } from "../types";

export function HandleFAQEvent(ev: NDKEvent, state: Nostrocket): Error | null {
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
  let f = new FAQ();
  let [rocket, err] = getRocketFromEvent(ev, state);
  if (err != null) {
    return err;
  }
  if (!rocket) {
    return new Error("could not find rocket");
  }
  if (rocket.FAQ.has(ev.id)) {
    return new Error("already handled this event")
  }
  f.RocketID = rocket.UID;
  err = populateFAQFromEvent(f, ev)
  if (err != null) {return err}
  f.CreatedBy = ev.pubkey;
  f.LastUpdateUnix = ev.created_at!;
  f.Events.push(ev.id);
  f.UID = ev.id;
  rocket.FAQ.set(f.UID, f);
  return null;
}

let attempted = new Set()
function handleModification(ev: NDKEvent, state: Nostrocket): Error | null {
  if (!attempted.has(ev.id)) {
    attempted.add(ev.id)
  }
  let [rocket, err] = getRocketFromEvent(ev, state);
  if (err != null) {
    return err;
  }
  if (!rocket) {
    throw new Error("this should not happen");
  }
  let modID = labelledTag(ev, "", "modifies");
  if (!modID) {
    return new Error("could not find a modification ID");
  }
  let f = rocket.FAQ.get(modID);
  if (!f) {
    return new Error("could not find existing FAQ in current state");
  }
  if (ev.created_at! <= f.LastUpdateUnix) {
    return new Error ("this event was published earlier than the latest one we have")
  }
  let errP = populateFAQFromEvent(f, ev)
  if (errP != null) {return err}
  f.LastUpdateUnix = ev.created_at!;
  f.Events.push(ev.id);
  rocket.FAQ.set(modID, f)
  return null
}

function populateFAQFromEvent(f: FAQ, ev: NDKEvent): Error | null {
  let question = labelledTag(ev, "question", "text");
  if (!question) {
    return new Error("could not find question");
  }
  f.Question = question;
  let sentence = labelledTag(ev, "sentence", "text");
  let paragraph = labelledTag(ev, "paragraph", "text");
  let page = labelledTag(ev, "page", "text");
  if (sentence) {
    f.AnswerSentence = sentence;
  }
  if (paragraph) {
    f.AnswerParagraph = paragraph;
  }
  if (page) {
    f.AnswerPage = page;
  }
  return null
}
