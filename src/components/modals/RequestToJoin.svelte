<script lang="ts">
  import {
    Button,
    Modal
  } from "carbon-components-svelte";
  import { User } from "carbon-pictograms-svelte";
let formOpen = false
</script>

<Button
  size="small"
  icon={User}
  on:click={() => {
    formOpen = true;
  }}>Request to Join</Button>

<Modal
  bind:open={formOpen}
  primaryButtonIcon={User}
  selectorPrimaryFocus=".bx--text-input"
  modalHeading="Request to Join"
  primaryButtonText = "OK"
  on:submit={() => {formOpen=false}}
>
Someone who's already in Nostrocket needs to vouch for you and add you to the Identity Tree. If you know anyone listed here, tag them in a note and ask them to add you.

</Modal>
