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
    <p>Problems SHOULD be granular enough that they can be solved with 6 hours or less of working time. If you think it's more complicated than that, it means you should add more granular child problems to this one and claim one of those instead.</p>
    <br />
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
