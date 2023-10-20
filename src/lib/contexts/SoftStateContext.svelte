<script lang="ts">
    import {getContext, setContext} from "svelte";
    import {consensusTipState, recursiveList} from "$lib/consensus/state";
    import {derived, get, type Stores} from "svelte/store";
    import {type Account} from "$lib/types";
    import {ignitionPubkey, nostrocketIgnitionEvent} from "$lib/settings";
    import {profiles} from "$lib/stores/profiles";
    import ndk from "$lib/stores/ndk";
    import {NDKUser} from "@nostr-dev-kit/ndk";

    const currentTipState = getContext('consensusTipState')

    const nostrocketParticipants = derived(consensusTipState, ($cts) => {
        let orderedList: Account[] = [];
        recursiveList(nostrocketIgnitionEvent, ignitionPubkey, $cts, orderedList);
        return orderedList;
    });

    nostrocketParticipants.subscribe((pkList) => {
        pkList.forEach((pk) => {
            let user = $ndk.getUser({hexpubkey: pk})
            user.fetchProfile().then((profile) => {
                if (user.profile) {
                    profiles.update((data) => {
                        data.set(user.pubkey, user);
                        return data;
                    });
                }
            });
        });
    });

    const nostrocketParticipantProfiles = derived(profiles, ($p) => {
        let orderedProfiles: { profile: NDKUser; index: number }[] = [];
        get(nostrocketParticipants).forEach((pk, i) => {
            let profile = $p.get(pk);
            if (profile) {
                orderedProfiles.push({profile: profile, index: i});
            }
        });

        return orderedProfiles.reverse();
    });

    setContext('nostrocketParticipants', nostrocketParticipants)
    setContext('nostrocketParticipantProfiles', nostrocketParticipantProfiles)
</script>

<main>
    <slot/>
</main>