<script lang="ts">

  import { Tile } from "carbon-components-svelte";
    export let style:string;

</script>
<div style="height:10px">
<Tile style={style}>
    <slot />
</Tile>
</div>