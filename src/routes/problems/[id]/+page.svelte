<script lang="ts">
    import {consensusTipState} from "$lib/stores/nostrocket_state/master_state";
    import type {Problem} from "$lib/stores/nostrocket_state/types";
    import {page} from "$app/stores";
    import {Column, OverflowMenu, OverflowMenuItem, Row, SkeletonText, Tag, Tile} from "carbon-components-svelte";
    import {Chat, Unlocked, ManageProtection    } from "carbon-icons-svelte";
    import {ndk} from "$lib/stores/event_sources/relays/ndk";
    import type {NDKUserProfile} from "@nostr-dev-kit/ndk";
    import {makeHtml} from "$lib/helpers/mundane";
    import LogNewProblemModal from "../../../components/problems/LogNewProblemModal.svelte";

    let problem: Problem
    let createdBy: NDKUserProfile | undefined
    let claimedBy: NDKUserProfile | undefined

    $: {
        problem = $consensusTipState.Problems.get($page.params.id)
    }

    $: if (Boolean(problem?.CreatedBy) && !createdBy) {
        (async () => {
            const createdByUser = $ndk.getUser({hexpubkey: problem?.CreatedBy})
            await createdByUser.fetchProfile()
            createdBy = createdByUser.profile
        })()
    }

    $: if (Boolean(problem?.ClaimedBy) && !claimedBy) {
        (async () => {
            const claimedByUser = $ndk.getUser({hexpubkey: problem?.ClaimedBy})
            await claimedByUser.fetchProfile()
            claimedBy = claimedByUser.profile
        })()
    }

</script>


{#if Boolean(problem)}
    <Row>
        <Column sm={12} md={9} lg={9} class="problem-content">
            <Row>
                <Column>
                    <Row>
                        <Column md={4}>
                            <h3 style="text-transform: capitalize">
                                {problem?.Title}
                            </h3>
                            <p style="color: #94a3b8">Logged by <span style="color: #fb923c">{createdBy?.name}</span></p>
                        </Column>
                        <Column md={4} class="problem-item-actions">
                            <LogNewProblemModal parent={problem}/>
                            <OverflowMenu size="sm" flipped light icon={ManageProtection} style="border: 2px solid white; margin-left: 1rem">
                                <OverflowMenuItem text="Edit" hasDivider />
                                <OverflowMenuItem text="Tag" hasDivider />
                                <OverflowMenuItem text="Print" hasDivider />
                                <OverflowMenuItem text="Share" hasDivider />
                            </OverflowMenu>
                        </Column>
                    </Row>


                </Column>
            </Row>

            <Row padding={20}>
                <Column>
                    <Tile>
                        <h5 style="padding-bottom: 15px">Summary</h5>
                        {problem?.Summary || ''}
                    </Tile>
                </Column>
            </Row>

            <Row padding={10}>
                <Column style="text-align: justify; text-justify: inter-word">{@html makeHtml(problem?.FullText)}</Column>
            </Row>
        </Column>

        <Column md={2} lg={3} class="problem-sidebar">
            <Row>
                <Column style="padding-bottom: 5px">
                    <p style="display: flex; align-items: center; text-transform: capitalize">
                        <Unlocked style={`color: ${problem?.Closed ? 'red' : 'green'}`}/>
                        &nbsp;&nbsp;
                        <span style={`color: ${problem?.Closed ? 'red' : 'green'}`}>{problem?.Closed ? 'Closed' : 'Open'}</span>
                    </p>
                </Column>
            </Row>
            <Row>
                <Column style="padding-bottom: 5px">
                    <p style="display: flex; align-items: center; text-transform: capitalize">
                        <Chat/>&nbsp;&nbsp;{problem?.Children?.size ?? 0} Sub problems
                    </p>
                </Column>
            </Row>

            <Row padding={5}>
                <Column>
                    <div style="border-bottom: 1px solid #262626; height: 5px"></div>
                </Column>
            </Row>

            <Row>
                <Column><h5>Assignees</h5></Column>
            </Row>

            <Row padding>
                <Column>
                    {#if claimedBy?.name}
                        <p>{claimedBy?.name || ''}</p>
                    {:else}
                        <a on:click={() => {}}>+ Claim Problem</a>
                    {/if}
                </Column>
            </Row>

            <Row padding>
                <Column><h5>Status</h5></Column>
            </Row>

            <Row>
                <Column>
                    <Tag>{problem?.Status}</Tag>
                </Column>
            </Row>
        </Column>
    </Row>
{:else}
    <Row padding={10}>
        <Column>
            <SkeletonText heading/>
        </Column>
    </Row>
    <Row>
        <Column>
            <SkeletonText paragraph/>
        </Column>
    </Row>
{/if}

