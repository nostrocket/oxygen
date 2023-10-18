<script lang="ts">
    import {getContext, onMount} from "svelte";
    import type {Readable, Stores} from "svelte/store";
    import {NDKUser} from "@nostr-dev-kit/ndk";
    import type {Account} from "$lib/types";
    import {derived, get} from "svelte/store";
    import {User} from "carbon-pictograms-svelte";
    import {AspectRatio, Button, Column, InlineNotification, Row, Tile,} from "carbon-components-svelte";
    import Profile from "../../../components/Profile.svelte";

    let nostrocketParticipantProfiles: Readable<{ profile: NDKUser; index: number }[]>

    const nostrocketParticipants = getContext<Readable<Account[]>>('nostrocketParticipants')
    const participantProfiles = getContext<Map<Account, NDKUser>>('participantProfiles')

    nostrocketParticipantProfiles = derived(<Stores>participantProfiles, ($participantProfile) => {
        let orderedProfiles: { profile: NDKUser; index: number }[] = [];

        get(nostrocketParticipants).forEach((pk, i) => {
            let profile = $participantProfile.get(pk);
            if (profile) {
                orderedProfiles.push({ profile: profile, index: i });
            }
        });

        return orderedProfiles.reverse();
    });
</script>

<Row>
    <Column max={4} lg={4} md={4} sm={16} aspectRatio="2x1">
        <Row style="height:99%;padding:2px;">
            <Tile light style="width:100%; height:100%;overflow:hidden;">
                <Row>
                    <Column>
                        <AspectRatio ratio="1x1" style="width:100%;">
                            todo: get user image from profile if we have pubkey, or use
                            silhouette if none.
                        </AspectRatio>
                    </Column>
                    <Column>
                        <Button icon={User}>REQUEST TO JOIN</Button>
                        <p>#{$nostrocketParticipantProfiles?.length}</p>
                    </Column>
                </Row>
            </Tile>
        </Row>
    </Column>
    {#each $nostrocketParticipantProfiles as p, i (p.profile.pubkey)}
        <Profile profile={p.profile} num={p.index}/>
    {/each}
</Row>