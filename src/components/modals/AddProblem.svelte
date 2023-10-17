<script lang="ts">
  import makeEvent from "$lib/helpers/eventMaker";
  import {
    nostrocketIgnitionEvent,
    nostrocketIgnitionTag,
    simulate
  } from "$lib/settings";
  import { currentUser } from "$lib/stores/current-user";
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
  import LoginNip07Button from "../LoginNIP07Button.svelte";

  export let parent = "";
  let buttonDisabled = true;
  let notLoggedIn = true;

  const profileData = writable<NDKUser|undefined>(undefined);

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
      let e = makeEvent({kind: 15171971, rocket: nostrocketIgnitionTag})
      if (!simulate) {
        e.publish()
          .then((x) => {
            console.log(e.rawEvent(), x);
            let text_event = textEvent();
            text_event
              .publish()
              .then((y) => {
                console.log(text_event.rawEvent(), y);
                let commit_event = commitEvent(e.id, text_event.id, "", "open");
                commit_event
                  .publish()
                  .then((z) => {
                    console.log(commit_event.rawEvent(), z);
                    //if we are a maintainer on this problem, publish a new HEAD
                    if (true) {
                      let head_event = headEvent(
                        e.id,
                        commit_event.id,
                        "open"
                      );
                      head_event
                        .publish()
                        .then((a) => {
                          console.log(head_event.rawEvent(), a);
                          formOpen = false;
                          reset();
                        })
                        .catch((err) => {
                          throw new Error(
                            "failed to publish Problem HEAD event. " + err
                          );
                        });
                    } else {
                      formOpen = false;
                      reset();
                    }
                  })
                  .catch((err) => {
                    throw new Error(
                      "failed to publish Problem COMMIT event. " + err
                    );
                  });
              })
              .catch((err) => {
                throw new Error("failed to publish Problem TEXT event. " + err);
              });
          })
          .catch((err) => {
            throw new Error("failed to publish Problem ANCHOR event. " + err);
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

  function headEvent(anchorID:string, commitID:string, status:string, rocket?:string) {
    let e = makeEvent({kind:31971})
    e.tags.push(["e", anchorID, "", "anchor"]);
    e.tags.push(["e", commitID, "", "commit"]);
    e.tags.push(["s", status]);
    if (parent.length != 64) {
      console.log("todo: add safeguards and user notifications for logging problems at the root level")
      throw new Error("comment out to log a problem at the root level")
    }
    if (parent.length == 64) {
      e.tags.push(["e", parent, "", "parent"]);
    }
    //todo get exiting problem from state and include existing parents (etc)
    let rocketTag = ["e", nostrocketIgnitionEvent, "", "rocket"];
    if (rocket) {
      rocketTag[1] = rocket;
    }
    e.tags.push(rocketTag);
    return e;
  }

  function commitEvent(anchorID:string, textID:string, previous:string, status:string) {
    let e = makeEvent({kind:15171972})
    e.tags.push(["e", anchorID, "", "anchor"]);
    e.tags.push(["e", textID, "", "text"]);
    if (previous) {
      e.tags.push(["e", previous, "previous"]);
    }
    e.tags.push(["s", status]);
    return e;
  }

  function textEvent() {
    let e = makeEvent({kind: 15171973})
    e.tags.push(["t", title_text, "title"]);
    if (summary_text.length > 0) {
      e.tags.push(["t", summary_text, "summary"]);
    }
    if (full_text.length > 0) {
      e.tags.push(["t", full_text, "full"]);
    }
    return e;
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

<Button size="small" icon={DataEnrichmentAdd}
  on:click={() => {
    formOpen = true;
  }}>{#if parent.length == 64}Create a sub-Problem{:else}Log a New Problem Now{/if} </Button>

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
      labelText="Problem Title"
      maxlength={100}
      bind:value={title_text}
      required
      style="margin-bottom:1%;"/>
    <TextArea
      bind:value={summary_text}
      labelText="Problem Summary"
      maxlength={280}
      placeholder="Briefly describe the problem you face or have observed. MUST be plaintext, no markdown. Max 280 characters."
      style="margin-bottom:1%;"/>
    <TextArea
      bind:value={full_text}
      labelText="Full Problem Statement [OPTIONAL]"
      placeholder="Explain the problem in full. Markdown is allowed."
      rows={20}
      style="margin-bottom:1%;"/>

  </Form>
</Modal>
