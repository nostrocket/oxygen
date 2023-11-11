<script lang="ts">
  import makeEvent from "$lib/helpers/eventMaker";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { Button, Form, Modal, TextInput } from "carbon-components-svelte";
  import { Rocket } from "carbon-pictograms-svelte";
  import { simulateEvents } from "../../settings";
  import LoginNip07Button from "../elements/LoginNIP07Button.svelte";
  import { eligibleForProcessing } from "$lib/stores/nostrocket_state/master_state";

  export let type: string = "";

  let formOpen = false;
  let rocketName = "";
  let formValidation = true;

  let nameError = "";
  let nameInvalid = false;

  function reset() {
    rocketName = "";
    nameError = "";
  }

  function onFormSubmit() {
    let e = makeEvent({ kind: 5 });
    if (type == "consensus" && rocketName == "") {
      $eligibleForProcessing.forEach((ce) => {
        if (ce.pubkey == $currentUser?.pubkey && ce.kind == 15172008) {
          e.tags.push(["e", ce.id]);
        }
      });
    } else {
      e.tags.push(["e", rocketName]);
    }
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
  }}>Delete an event (kind 5)</Button
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
  on:open={onFormOpen}
  on:click:button--secondary={() => (formOpen = false)}
  on:submit={() => (formValidation ? onFormSubmit() : null)}
>
  <Form on:submit={onFormSubmit}>
    {#if !$currentUser}
      <LoginNip07Button />
    {/if}
    <TextInput
      helperText="Use a name that describes the purpose of this new Rocket"
      invalid={nameInvalid}
      invalidText={nameError}
      labelText="Rocket Name"
      bind:value={rocketName}
      required
    />
  </Form>
</Modal>
