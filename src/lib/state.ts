import { writable } from "svelte/store";
import State from "./types";
// import {Nostrocket as n } from "./types";
import ndk from "./ndk";
import { get } from "svelte/store";
import type { Kind } from "nostr-tools";
import { CurrentState } from "./types";
import { NDKEvent, type NDKFilter } from "@nostr-dev-kit/ndk";

const initalRootIds = new Map<string, string>([
  [
    "IgnitionEvent",
    "1bf16cac62588cfd7e3c336b8548fa49a09627f03dbf06c7a4fee27bc01972c8",
  ],
  [
    "IdentityRoot",
    "ae14dd661475351993f626f66df8052ed73166796e5cd893c09e4d333e170bb5",
  ],
  [
    "Merits",
    "9f7211ac022b500a7adeeacbe44bb84225d1bb1ee94169f8c5d8d1640a154cbc",
  ],
  [
    "MirvsRoot",
    "0f56599b6530f1ed1c11745b76a0d0fc29934e9a90accce1521f4dfac7a78532",
  ],
  [
    "ReplayRoot",
    "9ab11d92bdeffd28762374d5dfc5286e0f494d7cff5bc00b4fce177bf1115b94",
  ],
  [
    "ProblemRoot",
    "6439b9ff8c19b537ba5cdb7a7809f2031eb34c033229117ecfe055f608ff8842",
  ],
  [
    "ignition_account",
    "546b4d7f86fe2c1fcc7eb10bf96c2eaef1daa26c67dad348ff0e9c853ffe8882",
  ],
]);

export function initialState() {
  let stateEvent = new NDKEvent();
  const ndkCurrent = get(ndk);
  const statusKind = 10311 as Kind;
  const filter: NDKFilter = {
    kinds: [statusKind],
    ["#e"]: [initalRootIds.get("IgnitionEvent") as string],
  };

  const subs = ndkCurrent.subscribe(filter, { closeOnEose: false });

  subs.on("event", (event: NDKEvent) => {
    console.log(event, " sds");
    handleEvent(event);
    let latesEvent = events[events.length - 1];
    let stateFromEvent = new State(latesEvent.content);
    CurrentState.update((existing) => {
      return stateFromEvent;
    });
  });
  subs.on("eose", (event: NDKEvent) => {
    let stateFromEvent = new State(event.content);
    CurrentState.update((existing) => {
      return stateFromEvent;
    });
    // latesEvent = event;
  });
}
const eventIds = new Set<string>();
const events: NDKEvent[] = [];
// let latesEvent = events[events.length - 1];
// let stateFromEvent = new State(latesEvent.content)
// export const CurrentState = writable(stateEvent)
const handleEvent = (event: NDKEvent) => {
  const id = event.tagId();
  let e = event;
  if (eventIds.has(id)) {
    const prevEvent = events.find((e) => e.tagId() === id);

    if (prevEvent && prevEvent.created_at! < event.created_at!) {
      // remove the previous event
      const index = events.findIndex((e) => e.tagId() === id);
      events.splice(index, 1);
    } else {
      return;
    }
  }
  eventIds.add(id);

  const index = events.findIndex((e) => e.created_at! < event.created_at!);
  if (index === -1) {
    events.push(e);
  } else {
    events.splice(index === -1 ? events.length : index, 0, e);
  }
};

const CurrentStateStatus = writable(CurrentState);
export default CurrentStateStatus;
