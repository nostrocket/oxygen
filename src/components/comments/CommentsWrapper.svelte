<script lang="ts">
  import { formatDateTime } from "$lib/helpers/mundane";
  import { ndk_profiles } from "$lib/stores/event_sources/relays/ndk";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { NDKEvent } from "@nostr-dev-kit/ndk";
  import {
    Button,
    ButtonSet,
    Column,
    InlineNotification,
    Row,
    StructuredList,
    StructuredListBody,
    StructuredListCell,
    StructuredListHead,
    StructuredListRow,
    TextArea,
    TextInput,
    breakpointObserver,
  } from "carbon-components-svelte";
  import { Reply } from "carbon-icons-svelte";
  import { onDestroy } from "svelte";
  import { derived, type Readable } from "svelte/store";
  import LoginButtonWithError from "../elements/LoginButtonWithError.svelte";
  import CommentUser from "./CommentUser.svelte";
  import type {
    NDKEventStore,
    ExtendedBaseType,
  } from "@nostr-dev-kit/ndk-svelte";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { comments } from "$lib/stores/hot_resources/comments";

  export let parentId: string;
  export let isRoot: boolean;
  export let depth: number = 0;
  export let problem: Problem | undefined = undefined;
  export let event: NDKEvent | undefined = undefined;
  export let filter: string | undefined = undefined;
  export let pubkey: string | undefined = undefined;
  export let disableReplies = false;
  export let numberOfComments = 0;
  export let onlyOne = false;

  let comment: string;
  let replyComment: string;
  let selectedCommentId: string | undefined;
  let toastTimeout: number = 0;
  let isReplying: boolean = false;

  const size = breakpointObserver();

  const postComment = async (content: string, commentId?: string) => {
    const ndkEvent = new NDKEvent($ndk_profiles);
    const eventMarker = isRoot ? "root" : "reply";
    const eventId = commentId ?? parentId;
    ndkEvent.kind = 1;
    ndkEvent.content = content;
    ndkEvent.tags = [...ndkEvent.tags, ...[["e", eventId, "", eventMarker]]];
    ndkEvent.tags.push(["e", problem.UID, "", "root"]);
    ndkEvent.tags.push(["p", problem.CreatedBy]);
    if (event) {
      ndkEvent.tags.push(["p", event.pubkey]);
      ndkEvent.tags.push(["e", event.id, "", "reply"]);
    }
    await ndkEvent.publish();

    toastTimeout = 2000;
    comment = "";
    const timeout = setTimeout(() => {
      toastTimeout = 0;
      clearTimeout(timeout);
    }, toastTimeout);
  };

  const postCommentReply = async (content: string, commentId) => {
    await postComment(content, commentId);
    replyComment = "";
    isReplying = false;
  };

  const onReplyComment = (commentId) => {
    selectedCommentId = commentId;
    isReplying = true;
  };

  const cancelReply = () => {
    selectedCommentId = undefined;
    isReplying = false;
  };
  //let commentsFromRelays: NDKEventStore<ExtendedBaseType<NDKEvent>>
  let commentsToRender: Readable<
    ExtendedBaseType<ExtendedBaseType<NDKEvent>>[]
  >;
  let cachedComments: Readable<NDKEvent[]>;

  $: {
    cachedComments = derived(
      [consensusTipState, comments],
      ([$cts, $comments]) => {
        let arr: NDKEvent[] = [];
        if (problem) {
          let _problem = $cts.Problems.get(problem.UID);
          if (_problem) {
            for (let p of _problem.Comments) {
              let ev = $comments.get(p);
              if (ev) {
                arr.push(ev);
              }
            }
          }
        }

        //console.log(arr)
        return arr;
      }
    );

    // commentsFromRelays = $ndk_profiles.storeSubscribe<NDKEvent>(
    //   { "#e": [parentId], kinds: [1] },
    //   { closeOnEose: false }
    // );

    // commentsFromRelays.subscribe((c) => {
    //       comments.update(co=>{
    //           for (let e of c) {
    //               co.set(e.id, e)
    //           }
    //           return co
    //       })
    //   });

    commentsToRender = derived(cachedComments, ($fromRelays) => {
      numberOfComments = $fromRelays.length;
      if (problem) {
        for (let e of $fromRelays) {
          problem.Pubkeys.add(e.pubkey);
        }
      }
      if (filter) {
        $fromRelays = $fromRelays.filter((x) => {
          return x.content.includes(filter!);
        });
      }
      if (pubkey) {
        $fromRelays = $fromRelays.filter((x) => {
          return x.pubkey == pubkey;
        });
      }
      if (onlyOne) {
        return $fromRelays.slice(0, 1);
      }
      return $fromRelays;
    });
  }

  onDestroy(() => {
    //commentStore.unsubscribe()
  });
</script>

<Row style="width:100%;"
  ><Column>
    {#if $commentsToRender}
      <Row
        ><Column>
          {#each [...$commentsToRender] as commentEvent}
            <div
              style={`display: flex; flex-wrap: wrap; flex-direction: row;padding-left: ${depth}rem; width: 100%;overflow:auto;`}
            >
              <StructuredList key={commentEvent.id} style="margin-bottom: 1rem">
                <StructuredListHead>
                  <StructuredListRow
                    head
                    style="border-bottom: none; padding-bottom: 0"
                  >
                    <StructuredListCell
                      head
                      style="display: flex; align-items: center; justify-content: space-between"
                    >
                      <div style="display: flex; align-items: center">
                        {#if !isRoot}
                          <Reply size={16} style="margin-right: 5px" />
                        {/if}

                        <CommentUser pubkey={commentEvent.pubkey} />
                        <span style="color: rgb(148, 163, 184);">
                          &nbsp; {$size !== "sm" ? "commented" : ""}
                          {formatDateTime(commentEvent.created_at)}
                        </span>
                      </div>

                      {#if $currentUser && !disableReplies}
                        <Button
                          kind="ghost"
                          size="small"
                          on:click={() => onReplyComment(commentEvent.id)}
                        >
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

                      {#if isReplying && selectedCommentId === commentEvent.id && !disableReplies}
                        <div>
                          <TextInput
                            hideLabel
                            bind:value={replyComment}
                            placeholder={`Add your reply`}
                            style="margin: 10px 0"
                          />
                          <ButtonSet>
                            <Button
                              size="small"
                              on:click={() =>
                                postCommentReply(
                                  replyComment,
                                  selectedCommentId
                                )}
                            >
                              Reply
                            </Button>
                            <Button
                              kind="secondary"
                              size="small"
                              on:click={cancelReply}>Cancel</Button
                            >
                          </ButtonSet>
                        </div>
                      {/if}
                    </StructuredListCell>
                  </StructuredListRow>
                </StructuredListBody>
              </StructuredList>
              {#if !onlyOne}
                <svelte:self
                  parentId={commentEvent.id}
                  depth={depth + 1}
                  isRoot={false}
                />
              {/if}
            </div>
          {/each}
        </Column></Row
      >
    {/if}

    {#if isRoot && !disableReplies}
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

        <TextArea
          light
          hideLabel
          placeholder="Write your comment here..."
          bind:value={comment}
        />
        <Button
          size="field"
          style="margin-top: 1rem; text-align: center"
          on:click={() => postComment(comment)}
        >
          Comment
        </Button>
      {:else}
        <LoginButtonWithError reason="comment on this problem" />
      {/if}
    {/if}
  </Column></Row
>
