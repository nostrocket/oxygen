import { allNostrocketEventKinds, kindsThatNeedConsensus, problemKinds } from "$lib/kinds";
import { rootEventID } from "$lib/settings";
import { problemEvents } from "$lib/stores/problems";
import { labelledTag } from "$lib/consensus/state";
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { get, writable } from "svelte/store";

export default function createEventpool(notstrict:boolean|undefined) {
  const raw = writable<Map<string, NDKEvent>>(new Map<string, NDKEvent>());
  const { subscribe, set, update } = raw;
  return {
    subscribe,
    push: (e: NDKEvent): void => {
      if (problemKinds.includes(e.kind)) {
        problemEvents.update(pe=>{
          if (!pe.get(e.id)) {
            pe.set(e.id, e)
          }
          return pe
        })
      }
      if (!notstrict) {
        if (labelledTag(e, "root", "e") == rootEventID && allNostrocketEventKinds.includes(e.kind? e.kind : 0)) {
          update((m) => {
            m.set(e.id, e);
            return m;
          });
        }
      }
      if (notstrict) {
        update((m) => {
          m.set(e.id, e);
          return m;
        });
      }
    },
    fetch: (id: string): NDKEvent | undefined => {
      return get(raw).get(id);
    },
    pop: (id: string): NDKEvent | undefined => {
      let val = get(raw).get(id);
      if (val) {
        update((m) => {
          m.delete(id);
          return m;
        });
      }
      return val;
    },
    singleIterator: (): NDKEvent[] => {
      let list: NDKEvent[] = [];
      get(raw).forEach((e) => {
        list.push(e);
      });
      return list;
    },
    length: (): number => {
      return get(raw).size;
    },
    stateChangeEvents: ():NDKEvent[] => {
      let list:NDKEvent[] = []
      get(raw).forEach((e) => {
        try {
          if (kindsThatNeedConsensus.includes(e.kind)) {
            list.push(e)
          }
        }
        catch {}
      })
      return list
    }
  };
}
