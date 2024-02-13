import { labelledTag } from "$lib/helpers/shouldBeInNDK";
import type { NDKEvent } from "@nostr-dev-kit/ndk";

const consensusKinds: Record<number, string> = {
  15171031: "Rocket Ignition",
  1031: "Rocket Ignition",
  1602: "Merit Request",
  1603: "Vote on Merit Request"
};

export const kindsThatNeedConsensus = Object.keys(consensusKinds).map((k) =>
  parseInt(k)
);

const problemKindRecord: Record<number, string> = {
  // 15171971: "Problem ANCHOR",
  // 15171972: "Problem COMMIT",
  // 15171973: "Problem TEXT",
  // 31971: "Problem HEAD",
  1971: "Problem Event",
  1972: "Problem Status",
};

export const problemKinds = Object.keys(problemKindRecord).map((k) =>
  parseInt(k)
);

const kinds: Record<number, string> = {
  15171031: "Rocket Ignition",
  1031: "Rocket Ignition",
  31108: "Rocket Metadata",
  2008: "Consensus Event",
  15172008: "Consensus Event",
  12008: "Consensus HEAD",
  31009: "Identity Tree Replaceable Event",
  1971: "Problem Event",
  1972: "Problem Status",
  1592: "Identity Tree",
  1602: "Merit Request",
  1603: "Vote on Merity Request",
  1122: "FAQ"
  // 15171971: "Problem ANCHOR",
  // 15171972: "Problem COMMIT",
  // 15171973: "Problem TEXT",
  // 31971: "Problem HEAD",
  //1: "well, what do you think this is...?",
};

export function kindToText(kind: number): string {
  if (kind in kinds) {
    return kinds[kind];
  }

  return `Unknown kind ${kind}`;
}

export function kindToDescription(kind: number): string {
  switch (kind) {
    case 2008:
    case 15172008:
      return "This is a Consensus event.";
    case 12008:
      return "This is a Consensus HEAD event"
    case 1031:
    case 15171031:
      return "This is a Rocket ignition event.";
    case 31009:
      return "This is a list of pubkeys to be included in an Identity Tree";
    case 1971:
      return "This is an event that describes a Problem";
    case 1972:
      return "This is a problem status update event";
    case 1592:
      return "This is a list of pubkeys to be included in an Identity Tree";
    case 1602:
      return "This is a request for Merits"
    case 1603:
      return "This is a vote on a Merit Request"
    case 1122:
      return "This is a FAQ"
    // case 15171971:
    //   return "This is a Problem ANCHOR event.";
    // case 15171972:
    //   return "This is a Problem COMMIT event";
    // case 15171973:
    //   return "This is a Problem TEXT event, it contains the title, summary, and body of a Problem";
    // case 31971:
    //   return "This is a problem HEAD event.";
  }
  return "could not find a description for this kind number";
}


export function kindToVerb(ev: NDKEvent): string {
  switch (ev.kind) {
    case 2008:
    case 15172008:
      return "published a consensus event";
    case 12008:
      return "published a consensus HEAD"
    case 1031:
    case 15171031:
      return "created a new rocket";
    case 31009:
      return "added someone to the web of trust";
    case 1971:
      if (labelledTag(ev, "problem", "e")) { return "edited a problem"}
      return "logged a new problem";
    case 1972:
      return "changed the status of a problem";
    case 1592:
      return "added someone to the web of trust";
    case 1602:
      return "requested merits for solving a problem"
    case 1603:
      return "voted on a request for merits"
    case 1122:
      return "published a new FAQ"
    // case 15171971:
    //   return "This is a Problem ANCHOR event.";
    // case 15171972:
    //   return "This is a Problem COMMIT event";
    // case 15171973:
    //   return "This is a Problem TEXT event, it contains the title, summary, and body of a Problem";
    // case 31971:
    //   return "This is a problem HEAD event.";
  }
  return "could not find a description for this kind number";
}



export const allNostrocketEventKinds = Object.keys(kinds).map((k) =>
  parseInt(k)
);

export function eventUserReference(event: NDKEvent | string): string {
  const id = typeof event === "string" ? event : event.id;

  return "#" + id.slice(0, 4);
}
