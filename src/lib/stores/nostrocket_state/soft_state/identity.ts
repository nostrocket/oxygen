
import { derived, get } from "svelte/store";
import { nostrocketIgnitionEvent, ignitionPubkey } from "../../../../settings";
import { consensusTipState } from "../master_state";
import type { Account, Nostrocket } from "../types";
import { ndk_profiles } from "$lib/stores/event_sources/relays/profiles";
import { profiles } from "$lib/stores/hot_resources/profiles";
import type { NDKUser } from "@nostr-dev-kit/ndk";

export const nostrocketParticipants = derived(consensusTipState, ($cts) => {
    let orderedList: Account[] = [];
    recursiveList(nostrocketIgnitionEvent, ignitionPubkey, $cts, orderedList);
    return orderedList;
  });

  function recursiveList(
    rocket: string,
    rootAccount: Account,
    state: Nostrocket,
    orderedList: Account[]
  ) {
    if (!orderedList.includes(rootAccount)) {
      orderedList.push(rootAccount);
    }
    state.RocketMap.get(rocket)
      ?.Participants.get(rootAccount)
      ?.forEach((pk) => {
        recursiveList(rocket, pk, state, orderedList);
      });
    return orderedList;
  }

  nostrocketParticipants.subscribe((pkList) => {
    pkList.forEach((pk) => {
        //console.log(pk)
      let user = get(ndk_profiles).getUser({ hexpubkey: pk });
      user.fetchProfile().then(() => {
        if (user.profile) {
          profiles.update((data) => {
            data.set(user.pubkey, user);
            return data;
          });
        }
      });
    });
  });


//for some reason this doesn't work in this file, currently debugging why.  
  export const nostrocketParticipantProfiles = derived(profiles, ($p) => {
    let orderedProfiles: { profile: NDKUser; index: number }[] = [];
    get(nostrocketParticipants).forEach((pk, i) => {
      let profile = $p.get(pk);
      if (profile) {
        orderedProfiles.push({ profile: profile, index: i });
      }
    });
    return orderedProfiles.reverse();
  });

