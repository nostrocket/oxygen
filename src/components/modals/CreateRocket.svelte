<script lang="ts">
  import makeEvent from "$lib/helpers/eventMaker";
  import { validateIdentity } from "$lib/protocol_validators/rockets";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { nameIsUnique } from "$lib/stores/nostrocket_state/hard_state/rockets";
  import { Button, Form, Modal, TextInput } from "carbon-components-svelte";
  import { Rocket } from "carbon-pictograms-svelte";
  import { get } from "svelte/store";
  import { rocketNameValidator, simulateEvents } from "../../settings";
  import LoginNip07Button from "../elements/LoginNIP07Button.svelte";

  let formOpen = false;
  let rocketName = "";
  let formValidation = true;

  let disableButton = true;

  let nameError = "";
  let nameInvalid = true;

  function reset() {
    rocketName = "";
    nameError = "";
  }

  $: {
    disableButton = true;
    if (!get(currentUser)?.pubkey) {
      nameError = "You must login first";
    } else if (!validateIdentity(get(currentUser)!.pubkey)) {
      nameError = "You must be in the Identity Tree to launch a new Rocket";
    } else if (!rocketNameValidator.test(rocketName)) {
      nameInvalid = true;
      nameError = "Rocket names MUST be 5-20 alphanumeric characters";
    } else if (!nameIsUnique(rocketName)) {
      nameInvalid = true;
      nameError = "Rocket names MUST be unique";
    } else {
      nameInvalid = false;
      nameError = "";
      if (get(currentUser)?.pubkey) {
        disableButton = false;
      }
    }
  }

  function onFormSubmit() {
    if (!disableButton) {
      let e = makeEvent({ kind: 15171031 });
      e.tags.push(["t", rocketName, "name"]);
      if (!simulateEvents) {
        e.publish()
          .then((x) => {
            console.log(e.rawEvent());
            console.log("published to:", x);
            formOpen = false;
            reset();
          })
          .catch(() => console.log("failed to publish"));
      } else {
        console.log("simulation mode, not publishing events");
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
  icon={Rocket}
  on:click={() => {
    formOpen = true;
  }}>Launch a New Rocket Now</Button
>

<Modal
  bind:open={formOpen}
  shouldSubmitOnEnter={false}
  primaryButtonText="Let's Fucking Go"
  secondaryButtonText="Cancel"
  primaryButtonIcon={Rocket}
  selectorPrimaryFocus=".bx--text-input"
  modalHeading="Launch a New Rocket!"
  hasForm
  primaryButtonDisabled={disableButton}
  on:open={onFormOpen}
  on:click:button--secondary={() => (formOpen = false)}
  on:submit={() => (formValidation ? onFormSubmit() : null)}
>
  <Form on:submit={onFormSubmit}>
    {#if !$currentUser}
      <LoginNip07Button />
    {/if}
    <TextInput
      disabled={$currentUser ? false : true}
      helperText="Use a name that describes the purpose of this new Rocket"
      invalid={nameInvalid}
      invalidText={nameError}
      labelText="Rocket Name"
      bind:value={rocketName}
      required
    />
    [TODO: iterate over Problems to find all created by current user and allow them
    to select one for this Rocket]
  </Form>
</Modal>
