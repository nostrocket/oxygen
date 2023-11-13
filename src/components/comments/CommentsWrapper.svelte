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
        TextInput
    } from "carbon-components-svelte";
    import {NDKEvent} from "@nostr-dev-kit/ndk";
    import {ndk} from "$lib/stores/event_sources/relays/ndk";
    import {currentUser} from "$lib/stores/hot_resources/current-user";
    import {onMount} from "svelte";
    import {formatDateTime} from "$lib/helpers/mundane";
    import CommentUser from "./CommentUser.svelte";
    import {Reply} from "carbon-icons-svelte";

    export let parentId: string;
    export let isRoot: boolean;
    export let depth: number = 0

    let comment: string
    let replyComment: string
    let commentEvents: Set<NDKEvent>
    let selectedCommentId: string | undefined;
    let toastTimeout: number = 0;
    let isReplying: boolean = false

    const postComment = async (content: string, commentId?: string) => {
        const ndkEvent = new NDKEvent($ndk)
        const eventMarker = isRoot ? 'root' : 'reply'
        const eventId = commentId ?? parentId

        ndkEvent.kind = 1
        ndkEvent.content = content
        ndkEvent.tags = [...ndkEvent.tags, ...[["e", eventId, "", eventMarker], ["p", $currentUser!.pubkey]]]
        await ndkEvent.publish()

        toastTimeout = 2000
        comment = ''
        const timeout = setTimeout(() => {
            toastTimeout = 0
            clearTimeout(timeout)
        }, toastTimeout)
    }

    const postCommentReply = async (content: string, commentId) => {
        await postComment(content, commentId)
        replyComment = ''
    }

    const onReplyComment = (commentId) => {
        selectedCommentId = commentId
        isReplying = true
    }

    const cancelReply = () => {
        selectedCommentId = undefined
        isReplying = false
    }

    onMount(() => {
        (async () => {
            commentEvents = await $ndk.fetchEvents({kinds: [1], '#e': [parentId]})
        })()
    })

</script>

{#if commentEvents}
    {#each commentEvents?.entries() as [key, commentEvent]}
        <div style={`margin-left: ${depth*2}rem`}>
            <StructuredList key={commentEvent.id} style="margin-bottom: 1rem">
                <StructuredListHead>
                    <StructuredListRow head style="border-bottom: none; padding-bottom: 0">
                        <StructuredListCell head
                                            style="display: flex; align-items: center; justify-content: space-between">
                            <div style="display: flex; align-items: center">
                                {#if !isRoot}
                                    <Reply size={16} style="margin-right: 5px"/>
                                {/if}

                                <CommentUser pubkey={commentEvent.pubkey}/>
                                <span style="color: rgb(148, 163, 184);">
                                &nbsp;commented {formatDateTime(commentEvent.created_at)}
                            </span>
                            </div>

                            {#if $currentUser}
                                <Button kind="ghost" size="small" on:click={() => onReplyComment(commentEvent.id)}>
                                    reply
                                </Button>
                            {/if}
                        </StructuredListCell>
                    </StructuredListRow>
                </StructuredListHead>
                <StructuredListBody>
                    <StructuredListRow>
                        <StructuredListCell>
                            {commentEvent.content}

                            {#if isReplying && selectedCommentId === commentEvent.id}
                                <div>
                                    <TextInput hideLabel
                                               bind:value={replyComment}
                                               placeholder={`Add your reply`}
                                               style="margin: 10px 0"
                                    />
                                    <Button size="small"
                                            on:click={() => postCommentReply(replyComment, selectedCommentId)}
                                    >
                                        Reply
                                    </Button>
                                    <Button kind="danger-tertiary" size="small" on:click={cancelReply}>Cancel</Button>
                                </div>
                            {/if}
                        </StructuredListCell>
                    </StructuredListRow>
                </StructuredListBody>
            </StructuredList>


            <svelte:self parentId={commentEvent.id} depth={depth + 1} isRoot={false}/>
        </div>
    {/each}
{/if}

{#if isRoot}
    {#if $currentUser}
        {#if toastTimeout > 0}
            <InlineNotification
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
{/if}




