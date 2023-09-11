import type { NDKEvent } from "@nostr-dev-kit/ndk";

const kinds: Record<number, string> = {
    10311: "Precomputed State",
};

export function kindToText(kind: number): string {
    if (kind in kinds) {
        return kinds[kind];
    }

    return `Unknown kind ${kind}`;
}

export function kindToDescription(kind: number): string | undefined {
    switch (kind) {
        case 10311: return "This is an event containing a precomputed Nostrocket state. This MAY be used for optimistically rendering the current state in browser clients.";
    }
}

export const allNostrocketEventKinds = Object.keys(kinds).map((k) => parseInt(k));

export function eventUserReference(event: NDKEvent | string): string {
    const id = typeof event === "string" ? event : event.id;

    return "#" + id.slice(0, 4);
}