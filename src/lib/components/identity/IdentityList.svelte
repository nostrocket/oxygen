<script lang="ts">
    import {getContext} from "svelte";
    import {User} from "carbon-pictograms-svelte";
    import {AspectRatio, Button, Column, Row, Tile,} from "carbon-components-svelte";
    import Profile from "../../../components/Profile.svelte";

    const nostrocketParticipantProfiles = getContext('nostrocketParticipantProfiles')
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