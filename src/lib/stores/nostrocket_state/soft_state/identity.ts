
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
        if (pk?.length == 64 && !orderedList.includes(pk)) {
          //problem: a LOT of recursion here
          return recursiveList(rocket, pk, state, orderedList);
        }        
      });
    return orderedList;
  }

  nostrocketParticipants.subscribe((pkList) => {
    pkList.forEach((pk) => {
        //console.log(pk)
      let user = get(ndk_profiles).getUser({ hexpubkey: pk });
      user.fetchProfile().then(() => {
        
          profiles.update((data) => {
            let existing = data.get(user.pubkey)
            if (!existing) {
              data.set(user.pubkey, user);
            }
            if (user.profile?.name && user.profile.about && user.profile.displayName) {
              data.set(user.pubkey, user);
            }
            return data;
          });
        
      });
    });
  });


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

