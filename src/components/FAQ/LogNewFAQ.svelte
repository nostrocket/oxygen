<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import makeEvent from "$lib/helpers/eventMaker";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { HandleProblemEvent } from "$lib/stores/nostrocket_state/soft_state/simplifiedProblems";
  import { FAQ } from "$lib/stores/nostrocket_state/types";
  import {
    Button,
    ButtonSet,
    InlineNotification,
    TextArea,
    TextInput,
    Tile,
  } from "carbon-components-svelte";
  import { Close, ConvertToCloud } from "carbon-icons-svelte";
  import { derived } from "svelte/store";
  import { nostrocketIgnitionEvent, simulateEvents } from "../../settings";
  import LoginNip07Button from "../elements/LoginNIP07Button.svelte";

  export let rocketID: string = nostrocketIgnitionEvent;
  export let open = true;

  let rocket = derived(consensusTipState, ($cts) => {
    return $cts.RocketMap.get(rocketID);
  });

  let isMaintainer = derived(
    [currentUser, rocket],
    ([$currentUser, $rocket]) => {
      if ($rocket && $currentUser) {
        if ($rocket.isMaintainer($currentUser.pubkey)) {
          return true;
        }
      }
      return false;
    }
  );

  export let newFAQ: FAQ = new FAQ();

  function publish() {
    let e = makeEvent({
      kind: 1122,
      rocket: $rocket!.UID,
    });
    e.tags.push(["text", newFAQ.Question, "question"]);
    if (newFAQ.AnswerSentence) {
      e.tags.push(["text", newFAQ.AnswerSentence, "sentence"]);
    }
    if (newFAQ.AnswerParagraph) {
      e.tags.push(["text", newFAQ.AnswerParagraph, "paragraph"]);
    }
    if (newFAQ.AnswerParagraph) {
      e.tags.push(["text", newFAQ.AnswerPage, "page"]);
    }

    if (newFAQ.UID?.length != 64) {
      e.tags.push(["new"]);
    } else {
      e.tags.push(["modifies", newFAQ.UID]);
      e.tags.push(["e", newFAQ.UID]);
      e.tags.push(["p", newFAQ.CreatedBy]);
    }
    e.tags.push([
      "alt",
      "[ " + newFAQ.Question + " ]" + newFAQ.AnswerParagraph,
    ]);
    e.author = $currentUser!;
    e.content =
      "[ " +
      newFAQ.Question +
      " ]" +
      newFAQ.AnswerParagraph +
      " read more using a Nostrocket client.";


    if (!simulateEvents) {
      e.publish()
        .then((x) => {
          console.log(e.rawEvent(), x);
          goto(`${base}/FAQ/${e.id}`);
        })
        .catch((err) => {
          console.log(e);
          throw new Error("failed to publish Problem event. " + err);
        });
    } else {
      e.sign().then(() => {
        console.log(e.rawEvent());
      });
    }
  }
</script>
{#if !$currentUser}
  <InlineNotification
    kind="error"
    title="ERROR:"
    subtitle="You must be logged in to do this."
  />
  <LoginNip07Button />
{/if}

{#if $currentUser}
  {#if !$isMaintainer}
    <InlineNotification
      kind="error"
      title="ERROR:"
      subtitle="You must be a maintainer to add a new FAQ."
    />
  {/if}
  {#if $isMaintainer}
    <Tile>
      <h4>The Question</h4>
      <TextInput
        placeholder="What is the question"
        bind:value={newFAQ.Question}
      />
      <h4>Answer (one sentence)</h4>
      <TextInput
        maxlength={140}
        placeholder="Provide the simplest possible answer in one sentence"
        bind:value={newFAQ.AnswerSentence}
      />
      <h4>Answer (one paragraph, optional)</h4>
      <TextArea
        maxlength={560}
        placeholder="Provide a one paragraph answer"
        bind:value={newFAQ.AnswerParagraph}
      />
      <h4>Answer (one page, markdown supported, optional)</h4>
      <TextArea
        maxlength={2016}
        placeholder="provide a one page answer (markdown is supported)"
        bind:value={newFAQ.AnswerPage}
      />
      <ButtonSet>
        <Button
          disabled={newFAQ.Question.length < 20}
          icon={ConvertToCloud}
          on:click={() => {
            publish();
          }}>PUBLISH</Button
        >
        <Button
        kind="secondary"
        icon={Close}
        on:click={() => {
            open = false
        }}>CANCEL</Button
      >
        <Button
          kind="ghost"
          on:click={() => {
            console.log(newFAQ);
          }}>PRINT TO CONSOLE</Button
        >
      </ButtonSet>
    </Tile>
  {/if}
{/if}
