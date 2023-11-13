<script lang="ts">
    import {
        Button,
        InlineNotification,
        StructuredList,
        StructuredListBody,
        StructuredListCell,
        StructuredListHead,
        StructuredListRow,
        TextArea,
        ToastNotification
    } from "carbon-components-svelte";
    import {NDKEvent} from "@nostr-dev-kit/ndk";
    import {ndk} from "$lib/stores/event_sources/relays/ndk";
    import {currentUser} from "$lib/stores/hot_resources/current-user";
    import {onMount} from "svelte";
    import CommentUser from "./CommentUser.svelte";
    import {formatDateTime} from "$lib/helpers/mundane";

    export let parentId: string;
    export let isRoot: boolean = false

    let comment: string
    let commentEvents: Set<NDKEvent>
    let selectedCommentId: string;
    let toastTimeout: number = 0;

    const postComment = async (content: string) => {
        const ndkEvent = new NDKEvent($ndk)
        const eventMarker = isRoot ? 'root' : 'reply'
        const eventId = isRoot ? parentId : selectedCommentId

        ndkEvent.kind = 1
        ndkEvent.content = content
        ndkEvent.tags = [...ndkEvent.tags, ...[["e", eventId, "", eventMarker], ["p", $currentUser!.pubkey]]]
        await ndkEvent.publish()

        //add nip89 support

        const recommendationEvent = new NDKEvent($ndk)
        recommendationEvent.kind = 31989
        recommendationEvent.tags = [["d","1971"],["a","31990:cc8d072efdcc676fcbac14f6cd6825edc3576e55eb786a2a975ee034a6a026cb:NKCQKDN","wss://nostr.688.org","web"]]
        await recommendationEvent.publish()

        toastTimeout = 2000
        comment = ''
        const timeout = setTimeout(() => {
            toastTimeout = 0
            clearTimeout(timeout)
        }, toastTimeout)
    }

    const onReplyComment = (commentId) => {
        selectedCommentId = commentId
        isRoot = false
    }

    onMount(() => {
        (async () => {
            commentEvents = await $ndk.fetchEvents({kinds: [1], '#e': [parentId]})
        })()
    })

</script>


{#if commentEvents}
    {#each commentEvents?.entries() as [key, commentEvent]}
        <StructuredList key={commentEvent.id} style="margin-bottom: 1rem">
            <StructuredListHead>
                <StructuredListRow head style="border-bottom: none; padding-bottom: 0">
                    <StructuredListCell head style="display: flex; align-items: center; justify-content: space-between">
                        <div>
                            <CommentUser pubkey={commentEvent.pubkey}/>
                            <span style="color: rgb(148, 163, 184);">
                                &nbsp;commented {formatDateTime(commentEvent.created_at)}
                            </span>
                        </div>

                        <Button kind="ghost" size="small" on:click={() => onReplyComment(commentEvent.id)}>reply
                        </Button>
                    </StructuredListCell>
                </StructuredListRow>
            </StructuredListHead>
            <StructuredListBody>
                <StructuredListRow>
                    <StructuredListCell>
                        {commentEvent.content}
                    </StructuredListCell>
                </StructuredListRow>
            </StructuredListBody>
        </StructuredList>
    {/each}
{/if}

{#if $currentUser}
    {#if toastTimeout > 0}
        <ToastNotification
                fullWidth
                kind="success"
                title="Success"
                subtitle="Your comment has been successfully posted"
                timeout={toastTimeout}
        />
    {/if}
    <TextArea hideLabel placeholder="Write your comment here..." bind:value={comment}/>
    <Button size="field" style="margin-top: 1rem; text-align: center" on:click={() => postComment(comment)}>
        Comment
    </Button>
{:else}
    <InlineNotification
            fullWidth
            hideCloseButton
            kind="warning"
            title="Login required:"
            subtitle="You need to login to post a comment."
    />
{/if}



