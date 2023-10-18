<script lang="ts">
    import NDKSvelte from "@nostr-dev-kit/ndk-svelte";
    import {ignitionPubkey, nostrocketIgnitionEvent} from "$lib/settings";
    import {derived, type Stores, writable} from "svelte/store";
    import {getContext, onMount, setContext} from "svelte";
    import type {Account, Nostrocket} from "$lib/types";
    import {recursiveList} from "$lib/helpers/mundane";
    import {NDKEvent, NDKUser} from "@nostr-dev-kit/ndk";

    const ndkProfiles = getContext<NDKSvelte>('ndkProfiles')
    const consensusTipState = getContext<Nostrocket>('consensusTipState')
    const participantProfiles = writable<Map<Account, NDKUser>>(new Map());

    const nostrocketParticipants = derived(<Stores>consensusTipState, ($consensusTipState) => {
        let orderedList: Account[] = [];
        recursiveList(nostrocketIgnitionEvent, ignitionPubkey, $consensusTipState, orderedList);
        console.log('From context ', {orderedList})
        return orderedList;
    })

    nostrocketParticipants.subscribe((pkList) => {
        pkList.forEach((pk) => {
            let user = $ndkProfiles.getUser({hexpubkey: pk});
            user.fetchProfile().then((profile) => {
                console.log({profile})
                if (user.profile) {
                    participantProfiles.update((data) => {
                        data.set(user.pubkey, user);
                        return data;
                    });
                }
            });
        });
    });

    const ndkProfilesSub = $ndkProfiles.storeSubscribe<NDKEvent>(
        {kinds: [0], authors: [ignitionPubkey]}, //"#e": [ignitionEvent]
        {closeOnEose: false}
    )

    ndkProfilesSub.onEose(() => {
        console.log('profile subs are here')
    })

    setContext('nostrocketParticipants', nostrocketParticipants)
    setContext('participantProfiles', participantProfiles)
</script>

<main>
    <slot/>
</main>