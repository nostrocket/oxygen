<script lang="ts">
  import makeEvent from "$lib/helpers/eventMaker";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { HandleProblemEvent } from "$lib/stores/nostrocket_state/soft_state/simplifiedProblems";
  import { Problem } from "$lib/stores/nostrocket_state/types";
  import type { NDKUser } from "@nostr-dev-kit/ndk";
  import {
    Button,
    Form,
    Modal,
    Row,
    Select,
    SelectItem,
    SelectItemGroup,
    TextArea,
    TextInput,
  } from "carbon-components-svelte";
  import { DataEnrichmentAdd } from "carbon-icons-svelte";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import {
    simulateEvents
  } from "../../settings";
  import LoginNip07Button from "../elements/LoginNIP07Button.svelte";

  export let parent: Problem | undefined = undefined;

  export let existing: Problem | undefined = undefined;

  let newProblem: Problem = new Problem()
  
  let buttonDisabled = true;
  let notLoggedIn = true;

  const profileData = writable<NDKUser | undefined>(undefined);

  let formOpen: boolean = false;
  let formValidation = true;

  let titleError = "";
  let titleInvalid = false;

  let selected_rocket:string|undefined = undefined

  onMount(()=>{
    if (existing){
      newProblem = existing.Copy()
    } else if (parent) {
      newProblem = new Problem()
      newProblem.Parents.add(parent.UID)
    }
    if (newProblem.Rocket) {
      selected_rocket = newProblem.Rocket
    }
  })

  $: {
    if (parent && !existing) {
          if (parent.Rocket) {
          newProblem.Rocket = parent.Rocket;
        }
        }

    if (newProblem.Title?.length < 10) {
      titleInvalid = true;
      titleError =
      newProblem.Title?.length.toString() +
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
    if (selected_rocket) {
      newProblem.Rocket = selected_rocket
    }
    buttonDisabled = titleInvalid || notLoggedIn;
  }

  function reset() {
    titleError = "";
  }

  function onFormSubmit() {
    if (!buttonDisabled) {
      let e = makeEvent({
        kind: 1971,
        rocket: newProblem.Rocket, //todo check parent problem's rocket and use that here
      });
      e.tags.push(["text", newProblem.Title, "tldr"]);
      if (newProblem.Summary) {
        e.tags.push(["text", newProblem.Summary, "paragraph"]);
      }
      if (newProblem.FullText) {
        e.tags.push(["text", newProblem.FullText, "page"]);
      }
      for (let p of newProblem.Parents) {
        e.tags.push(["e", p, "", "parent"]);
      }
      if (parent && !existing) {
        e.tags.push(["new"]);

      }
      if (!parent && existing) {
        e.tags.push(["e", existing.UID, "problem"])
      }
      e.tags.push(["status", newProblem.Status])
      e.tags.push(["alt", "Problem Tracker Event, NIP-1971"])
      e.author = $currentUser!

      let err = HandleProblemEvent(e, $consensusTipState.Copy())
      if (err != undefined) {
        console.log(err)
        return
      }
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
  >{#if parent?.UID.length == 64}Log a sub-problem{:else if existing}Edit this problem{:else}New Problem Now{/if}
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
      bind:value={newProblem.Title}
      required
      style="margin-bottom:1%;"
    />
    <TextArea
      bind:value={newProblem.Summary}
      labelText="One Paragraph"
      maxlength={280}
      placeholder="Use one paragraph to describe the problem you face or have observed. MUST be plaintext, no markdown. Max 280 characters."
      style="margin-bottom:1%;"
    />
    <TextArea
      bind:value={newProblem.FullText}
      labelText="One Page [OPTIONAL]"
      placeholder="Use as much space as required to explain the problem, one page is usually a good length. Markdown is allowed."
      rows={20}
      style="margin-bottom:1%;"
    />

    <Select hideLabel size="xl" labelText="Status" bind:selected={selected_rocket} fullWidth>
      <SelectItemGroup label="SELECT WHICH ROCKET THIS BELONGS TO">
        {#each $consensusTipState.RocketMap as [key, r]} 
          <SelectItem value={key} text={r.Name} />
        {/each}
      </SelectItemGroup>
    </Select>
  </Form>
</Modal>
