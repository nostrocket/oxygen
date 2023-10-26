<script lang="ts">
    import {consensusTipState} from "$lib/stores/nostrocket_state/master_state";
    import type {Problem} from "$lib/stores/nostrocket_state/types";
    import {page} from "$app/stores";
    import {Column, Row, SkeletonText, Tag} from "carbon-components-svelte";
    import {ndk} from "$lib/stores/event_sources/relays/ndk";
    import type {NDKUserProfile} from "@nostr-dev-kit/ndk";

    let problem: Problem
    let createdBy: NDKUserProfile | undefined
    let claimedBy: NDKUserProfile | undefined

    $: {
        problem = $consensusTipState.Problems.get($page.params.id)
    }

    $: if (Boolean(problem?.CreatedBy)) {
        (async () => {
            const createdByUser = $ndk.getUser({hexpubkey: problem?.CreatedBy})
            await createdByUser.fetchProfile()
            createdBy = createdByUser.profile
        })()
    }

    $: if (Boolean(problem?.ClaimedBy)) {
        (async () => {
            const claimedByUser = $ndk.getUser({hexpubkey: problem?.ClaimedBy})
            await claimedByUser.fetchProfile()
            claimedBy = claimedByUser.profile
        })()
    }

</script>


{#if Boolean(problem)}
    <Row>
        <Column sm={12} md={8} lg={9}>
            <Row>
                <Column>
                    <h3 style="text-transform: capitalize">
                        {problem?.Title}
                        <Tag size="sm" type={problem?.Closed ? 'red' : 'green'}>
                            {problem?.Closed ? 'closed' : 'open'}
                        </Tag>
                    </h3>

                    <p>{problem?.Summary || ''}</p>
                </Column>
            </Row>

            <Row padding={10}>
                <Column>
                    <p>{problem?.FullText || ''}</p>
                </Column>
            </Row>
        </Column>

        <Column md={2} lg={3}>
            <Row>
                <Column><p>Status</p></Column>
                <Column><p>{problem?.Status}</p></Column>
            </Row>
            <Row>
                <Column><p>Created by</p></Column>
                <Column><p>{createdBy?.name}</p></Column>
            </Row>
            <Row>
                <Column><p>Claimed by</p></Column>
                <Column><p>{claimedBy?.name || ''}</p></Column>
            </Row>
        </Column>
    </Row>
{:else}
    <Row padding={10}>
        <Column><SkeletonText heading /></Column>
    </Row>
    <Row>
        <Column><SkeletonText paragraph /></Column>
    </Row>
{/if}

