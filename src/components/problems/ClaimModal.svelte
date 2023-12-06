<script lang="ts">
  import {
    ComposedModal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Checkbox,
  } from "carbon-components-svelte";
  let checked = false;
  export let open = false;
  export let callback: () => void;
</script>

<ComposedModal
  {open}
  on:submit={() => {
    open = false;
    if (checked) {
      callback();
    }
  }}
>
  <ModalHeader label="Status Change" title="Claim this problem?" />
  <ModalBody hasForm>
    <p>Are you ready to work on this problem right now? After claiming, you will only have 144 blocks (~3 days) to submit a pull request.</p>
    <br />
    <Checkbox labelText="I'm ready to start working on this now" bind:checked />
  </ModalBody>
  <ModalFooter
    secondaryButtonText="Cancel"
    primaryButtonText="Proceed"
    primaryButtonDisabled={!checked}
  />
</ComposedModal>
