<script lang="ts">
    import {ignitionPubkey, rootEventID} from "$lib/settings";
    import NostrocketEvent from "$lib/events/NostrocketEvent";
    import {onDestroy, onMount, setContext} from "svelte";
    import ndk from "$lib/stores/ndk";
    import type {Identity, Rocket, RocketID} from "$lib/types";
    import {derived, writable} from "svelte/store";
    import {identity, rocket} from "$lib/types";
    import {allNostrocketEventKinds} from "$lib/kinds";
    import {labelledTag} from "$lib/consensus/state";

    type IdentityList = Identity[]
    type IdentityMap = Map<string, Identity>
    type EventPool = Map<string, NostrocketEvent>
    type RocketMap = Map<string, Rocket>

    const identityList = writable<IdentityList>([])
    const identityMap = writable<IdentityMap>(new Map())
    const eventsNotInState = writable<EventPool>(new Map()) // all state change requests that are potentially valid but not included in the current state.
    const validatedEvents = writable<EventPool>(new Map())
    const rocketMap = writable<RocketMap>(new Map())

    // Subscribe to all events that have a e tag, pointing to the ignition event with label root.
    const subscriptionOpts = {"#e": [rootEventID], kinds: [30000, 15172008, 15171031]}
    const nostrocketEvents = $ndk.storeSubscribe<NostrocketEvent>(subscriptionOpts, {closeOnEose: false}, NostrocketEvent)

    nostrocketEvents.subscribe((events) => {
        events.forEach((nostrocketEvent: NostrocketEvent) => {
            switch (nostrocketEvent.kind) {
                case 30000:
                    nostrocketEvent.getMatchingTags('d').forEach((ndkTag) => {
                        if (ndkTag[1].length === 64) {
                            const exisitingRocket = $rocketMap.get(ndkTag[1])

                            if (exisitingRocket) {
                                exisitingRocket.updateParticipants(nostrocketEvent)
                                rocketMap.update((current) => {
                                    current.delete(exisitingRocket.UID)
                                    current.set(exisitingRocket.UID, exisitingRocket)
                                    return current
                                })
                            }
                        }
                    })

                    break;

                //15171031 is a hard state change event, it cannot be handled this way. It must only be handled from mempool if and only if the current logged in user has the consensus lead, otherwise the only time it can be handled is if it is included in a kind 15172008 consensus event signed by someone with votepower in our current state.
                // case 15171031:
                //     nostrocketEvent.getMatchingTags('n').forEach((ndkTag) => {
                //         const newRocket = new rocket(undefined)
                //         newRocket.fromEvent(nostrocketEvent, ndkTag[1], undefined)
                //         rocketMap.update((current) => {
                //             current.set(newRocket.UID, newRocket)
                //             return current
                //         })
                //     })

                //     break;
                default:
                    console.log('Not yet implemented')
            }
        })
    })

    identityMap.subscribe(console.log)
    eventsNotInState.subscribe((some) => console.log({some}))

    setContext('rocketMap', rocketMap)

    onMount(() => {
        if (!($identityMap.get(ignitionPubkey))) {
            identityMap.set((new Map()).set(ignitionPubkey, new identity({
                Account: ignitionPubkey,
                Name: "Ignition Account",
                MaintainerBy: "1Humanityrvhus5mFWRRzuJjtAbjk2qwww",
                Order: 0,
                UniqueSovereignBy: "1Humanityrvhus5mFWRRzuJjtAbjk2qwww",
            })))
        }
    })

    onDestroy(() => {
        nostrocketEvents.unsubscribe()
    })
</script>

<main>
    <slot/>
</main>