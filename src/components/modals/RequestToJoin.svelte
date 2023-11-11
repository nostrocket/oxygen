<script lang="ts">
  import { Button, Modal } from "carbon-components-svelte";
  import { User } from "carbon-pictograms-svelte";
  let formOpen = false;
</script>

<Button
  size="small"
  icon={User}
  on:click={() => {
    formOpen = true;
  }}>Request to Join</Button
>

<Modal
  bind:open={formOpen}
  primaryButtonIcon={User}
  selectorPrimaryFocus=".bx--text-input"
  modalHeading="Request to Join"
  primaryButtonText="OK"
  on:submit={() => {
    formOpen = false;
  }}
>
  To join the Nostrocket Identity Tree, ask someone who's listed below to add
  you. The easiest way to do this is use any nostr client and tag them in a
  note.
</Modal>
