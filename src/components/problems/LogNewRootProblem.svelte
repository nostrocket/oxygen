<script lang="ts">
  import { Button, Modal } from "carbon-components-svelte";
  import { Rocket as RocketIcon } from "carbon-icons-svelte";

  let modalIsOpen = false
  let disableButton = true
  let formValidation = true

  export let parentModalOpen:boolean|undefined = undefined

  function onFormOpen() {}
  function onFormSubmit() {}

</script>

<Button on:click={()=>{modalIsOpen = true; if (parentModalOpen){parentModalOpen=false}}}>Log A New Problem Now</Button>

<Modal
  bind:open={modalIsOpen}
  shouldSubmitOnEnter={false}
  primaryButtonText="Let's Fucking Go"
  secondaryButtonText="Cancel"
  primaryButtonIcon={RocketIcon}
  selectorPrimaryFocus=".bx--text-input"
  modalHeading="Launch a New Rocket!"
  hasForm
  primaryButtonDisabled={disableButton}
  on:open={onFormOpen}
  on:click:button--secondary={() => (modalIsOpen = false)}
  on:submit={() => (formValidation ? onFormSubmit() : null)}
></Modal>