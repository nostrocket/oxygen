import type { NDKEvent } from "@nostr-dev-kit/ndk";

const consensusKinds: Record<number, string> = {
  15171031: "Rocket Ignition",
};

export const kindsThatNeedConsensus = Object.keys(consensusKinds).map((k) =>
  parseInt(k)
);

const problemKindRecord: Record<number, string> = {
  15171971: "Problem ANCHOR",
  15171972: "Problem COMMIT",
  15171973: "Problem TEXT",
  31971: "Problem HEAD",
};

export const problemKinds = Object.keys(problemKindRecord).map((k) =>
  parseInt(k)
);

const kinds: Record<number, string> = {
  10311: "Precomputed State",
  15171031: "Rocket Ignition",
  31108: "Rocket Metadata",
  15172008: "Consensus Event",
  30000: "Identity Tree Replaceable Event",
  15171971: "Problem ANCHOR",
  15171972: "Problem COMMIT",
  15171973: "Problem TEXT",
  31971: "Problem HEAD",
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
    case 10311:
      return "This is an event containing a precomputed Nostrocket state. This MAY be used for optimistically rendering the current state in browser clients.";
    case 15172008:
      return "This is a Consensus event.";
    case 15171031:
      return "This is a Rocket ignition event.";
    case 30000:
      return "This is a list of pubkeys to be included in an Identity Tree";
    case 15171971:
      return "This is a Problem ANCHOR event."
    case 15171972:
      return "This is a Problem COMMIT event"
    case 15171973:
      return "This is a Problem TEXT event, it contains the title, summary, and body of a Problem"
    case 31971:
      return "This is a problem HEAD event."
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
