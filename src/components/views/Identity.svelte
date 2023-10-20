<script>
    import {nostrocketParticipantProfiles} from "$lib/consensus/state";
    import {AspectRatio, Button, Column, InlineNotification, Row, Tile,} from "carbon-components-svelte";
    import {User} from "carbon-pictograms-svelte";
    import Profile from "../Profile.svelte";
    import AddIdentity from "../modals/AddIdentity.svelte";
    import IdentityContext from "$lib/contexts/IdentityContext.svelte";
    import IdentityList from "$lib/components/identity/IdentityList.svelte";
    import ndk from "$lib/stores/ndk";
    import {getContext, onDestroy} from "svelte";
    import softState from "$lib/stores/states/soft-state";
    import {writable} from "svelte/store";
    import SoftStateContext from "$lib/contexts/SoftStateContext.svelte";

    const rocketMap = getContext('rocketMap')
    const participants = writable([])

    // TODO: Rename this to profiles
    // const identities = $ndk.storeSubscribe(
    //     {kinds: [0], authors: [ignitionPubkey]},
    //     {closeOnEose: false},
    //     IdentityResource
    // )

    // subscribe to the rocketMap context
    // we can use this to get list of participants as well
    // rocketMap.subscribe((entries) => {
    //     entries.forEach((entry) => {
    //         console.log({entry})
    //     })
    // })
</script>

<SoftStateContext>
    <h2>These people have joined Nostrocket</h2>
    <Row>
        <Column>
            <InlineNotification lowContrast kind="info">
                <h4>Non-fungible Identity</h4>
                <p>
                    Nostrocket uses an identity tree to make sybil attacks cheaper to
                    mitigate against than it costs an attacker to conduct. Read more about
                    this in the Protocol.
                </p>
                <AddIdentity/>
            </InlineNotification>
        </Column>
    </Row>

    <IdentityList/>
</SoftStateContext>