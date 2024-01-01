<script lang="ts">
  import { loginNip07 } from "$lib/stores/event_sources/relays/ndk";
  import { Button } from "carbon-components-svelte";
  import { User } from "carbon-pictograms-svelte";


</script>

<Button size="small" on:click={()=>loginNip07(true)} icon={User}>NIP07 Login</Button>
<div />
