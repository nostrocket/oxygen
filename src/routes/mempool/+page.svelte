<script lang="ts">
    import {base} from "$app/paths";
    import {kindToDescription} from "$lib/stores/event_sources/kinds";
    import {Column, InlineNotification, ListItem, OrderedList, Row, UnorderedList,} from "carbon-components-svelte";
    import {
        differenceInDays,
        differenceInHours,
        differenceInMinutes,
        differenceInMonths,
        differenceInSeconds,
        differenceInYears,
        format
    } from 'date-fns'
    import {
        consensusTipState,
        eligableForProcessing,
        inState,
        notesInState
    } from "$lib/stores/nostrocket_state/master_state";

    function descriptionOfKind(kind: number) {
        if (kind) {
            let sc = kindToDescription(kind);
            if (sc) {
                return sc;
            }
        }
        return "";
    };

    function timeSince(unixTimestamp: number) {
        new Date(unixTimestamp);
    }

    // TODO: move function to $lib/helpers/mundane.ts when pending PRs are merged
    const formatDateTime = (unixTimestamp: number): string => {
        const now = new Date();
        const timestampDate = new Date(unixTimestamp * 1000)

        const diffInSeconds = differenceInSeconds(now, timestampDate)
        const diffInMinutes = differenceInMinutes(now, timestampDate)
        const diffInHours = differenceInHours(now, timestampDate)
        const diffInDays = differenceInDays(now, timestampDate)
        const diffInMonths = differenceInMonths(now, timestampDate)
        const diffInYears = differenceInYears(now, timestampDate)

        if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
        if (diffInHours < 24) return `${diffInHours} hours ago`
        if (diffInDays < 3) return `${diffInDays} days ago`
        if (diffInMonths < 11) return format(timestampDate, 'd MMM, h:mm a')
        if (diffInMonths >= 11 || diffInYears >= 1) return `${diffInYears} years ago`

        return ''
    }
</script>

<Row>
    <Column max={8} sm={8}>
        <h1>Consensus Event Chain</h1>

        <OrderedList>
            {#each $consensusTipState.ConsensusEvents as id}
                <ListItem>
                    <a style="color:deeppink;" href="{base}/eventviewer/{id}">{id}</a>
                </ListItem>
            {/each}
        </OrderedList>

        <h1>Events in Current State</h1>
        <h6>
            These events are valid under the Nostrocket Unprotocol and have caused a
            change to the Nostrocket state displayed in this app
        </h6>
        {#if $inState.size === 0}
            <InlineNotification lowContrast kind="info">
                <h4>Waiting for events</h4>
            </InlineNotification>
        {/if}
        <UnorderedList>
            {#each [...$notesInState.sort((a, b) => {
                if (a.created_at > b.created_at) {
                    return -1;
                } else {
                    return 1;
                }
            })] as event}
                <ListItem>
                    <span>
                        <a style="color:deeppink;" href="{base}/eventviewer/{event.id}">
                            [{event.id.substring(0, 8)}]
                        </a>
                    </span>

                    <span>
                        {descriptionOfKind(event.kind)} {formatDateTime(event.created_at)}

                    </span>
                </ListItem>
            {/each}
        </UnorderedList>
    </Column>

    <Column max={8} sm={8}>
        <h1>Events in Mempool</h1>
        <h6>
            This list may contain events that are invalid under the Nostrocket
            Unprotocol
        </h6>
        {#if $eligableForProcessing.length === 0}
            <InlineNotification lowContrast kind="info">
                <h4>There are no events waiting to be merged into the current state</h4>
            </InlineNotification>
        {/if}
        <Row>
            <UnorderedList>
                {#each $eligableForProcessing.sort((a, b) => {
                    if (a.created_at > b.created_at) {
                        return -1;
                    } else {
                        return 1;
                    }
                }) as event}
                    <ListItem>
                        <span>
                            <a style="color:deeppink;" href="{base}/eventviewer/{event.id}">
                                [{event.id.substring(0, 8)}]
                            </a>
                        </span>

                        <span>
                            {descriptionOfKind(event.kind)} {formatDateTime(event.created_at)}
                        </span>
                    </ListItem>
                {/each}
            </UnorderedList>
        </Row>
    </Column>
</Row>
