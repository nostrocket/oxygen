<script lang="ts">
  import makeEvent from "$lib/helpers/eventMaker";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import type { NDKUser } from "@nostr-dev-kit/ndk";
  import {
    Button,
    Form,
    Modal,
    Row,
    TextArea,
    TextInput,
  } from "carbon-components-svelte";
  import { DataEnrichmentAdd } from "carbon-icons-svelte";
  import { writable } from "svelte/store";
  import {
    ignitionPubkey,
    nostrocketIgnitionTag,
    simulateEvents,
  } from "../../settings";
  import LoginNip07Button from "../elements/LoginNIP07Button.svelte";
  import type { Problem } from "$lib/stores/nostrocket_state/types";

  export let parent: Problem | undefined = undefined;
  let buttonDisabled = true;
  let notLoggedIn = true;

  const profileData = writable<NDKUser | undefined>(undefined);

  let formOpen: boolean = false;
  let title_text: string = "";
  let summary_text = "";
  let full_text = "";
  let formValidation = true;

  let titleError = "";
  let titleInvalid = false;

  $: {
    if (title_text.length < 10) {
      titleInvalid = true;
      titleError =
        title_text.length.toString() +
        " characters isn't big enough for anyone...";
    } else {
      titleInvalid = false;
      titleError = "";
    }
    if ($currentUser) {
      notLoggedIn = false;
    } else {
      notLoggedIn = true;
    }

    buttonDisabled = titleInvalid || notLoggedIn;
  }

  function reset() {
    title_text = "";
    titleError = "";
  }

  function onFormSubmit() {
    if (!buttonDisabled) {
      if (parent?.UID.length != 64 && $currentUser?.pubkey !== ignitionPubkey) {
        console.log(
          "todo: most problems should NOT be at the root level; add safeguards and user notifications for logging problems at the root level"
        );
        throw new Error("comment out to log a problem at the root level");
      }
      let rocketID: string | undefined = undefined;
      if (parent) {
        if (parent.Rocket) {
          rocketID = parent.Rocket;
        }
      }
      let e = makeEvent({
        kind: 1971,
        rocket: rocketID ? rocketID : nostrocketIgnitionTag, //todo check parent problem's rocket and use that here
      });
      e.tags.push(["text", title_text, "tldr"]);
      if (summary_text.length > 0) {
        e.tags.push(["text", summary_text, "paragraph"]);
      }
      if (full_text.length > 0) {
        e.tags.push(["text", full_text, "page"]);
      }
      if (parent?.UID.length == 64) {
        e.tags.push(["e", parent!.UID, "", "parent"]);
      }
      e.tags.push(["status", "open"]);
      e.tags.push(["new"]);
      if (!simulateEvents) {
        e.publish()
          .then((x) => {
            console.log(e.rawEvent(), x);
            formOpen = false;
            reset();
          })
          .catch((err) => {
            console.log(e);
            throw new Error("failed to publish Problem event. " + err);
          });
      } else {
        e.sign().then(() => {
          console.log(e.rawEvent());
          formOpen = false;
          reset();
        });
      }
    }
  }

  function onFormOpen() {
    // Hack form assocation
    const modal = document.querySelector(".bx--modal");
    const form = modal.querySelector("form");
    const button = modal.querySelector(".bx--btn--primary");

    const id = "I" + Math.random().toString().substring(2);
    form.setAttribute("id", id);
    button.setAttribute("form", id);
    // Reverted by binding update on input change
    button.setAttribute("type", "submit");
  }
</script>

<Button
  size="small"
  icon={DataEnrichmentAdd}
  on:click={() => {
    formOpen = true;
  }}
  >{#if parent?.UID.length == 64}Log a sub-problem{:else}New Problem Now{/if}
</Button>

<Modal
  bind:open={formOpen}
  shouldSubmitOnEnter={false}
  primaryButtonText="Submit"
  secondaryButtonText="Cancel"
  primaryButtonIcon={DataEnrichmentAdd}
  selectorPrimaryFocus=".bx--text-input"
  modalHeading="Log a Problem You Currently Face or Have Observed"
  hasForm
  primaryButtonDisabled={buttonDisabled}
  on:open={onFormOpen}
  on:click:button--secondary={() => ((formOpen = false), reset())}
  on:submit={() => (formValidation ? onFormSubmit() : null)}
>
  <Form on:submit={onFormSubmit}>
    {#if !$currentUser}
      <Row>
        <LoginNip07Button />
      </Row>
    {/if}
    <TextInput
      invalid={titleInvalid}
      invalidText={titleError}
      labelText="Problem TL;DR"
      placeholder="Explain the problem in one short sentence"
      maxlength={100}
      bind:value={title_text}
      required
      style="margin-bottom:1%;"
    />
    <TextArea
      bind:value={summary_text}
      labelText="One Paragraph"
      maxlength={280}
      placeholder="Use one paragraph to describe the problem you face or have observed. MUST be plaintext, no markdown. Max 280 characters."
      style="margin-bottom:1%;"
    />
    <TextArea
      bind:value={full_text}
      labelText="One Page [OPTIONAL]"
      placeholder="Use as much space as required to explain the problem, one page is usually a good length. Markdown is allowed."
      rows={20}
      style="margin-bottom:1%;"
    />
  </Form>
</Modal>
