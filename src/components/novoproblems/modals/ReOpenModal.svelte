<script lang="ts">
  import {
    ComposedModal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Checkbox,
  } from "carbon-components-svelte";
  import { Send, SendAlt } from "carbon-icons-svelte";
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
  <ModalHeader label="Status Change" title="Re-Open this problem?" />
  <ModalBody hasForm>
    <p>
      Does this problem still exist? If so, you can re-open it now.</p>
    <br />
    <Checkbox labelText="This problem still exists" bind:checked />
  </ModalBody>
  <ModalFooter
    secondaryButtonText="CANCEL"
    primaryButtonText="PUBLISH"
    primaryButtonIcon={Send}
    primaryButtonDisabled={!checked}
  />
</ComposedModal>
