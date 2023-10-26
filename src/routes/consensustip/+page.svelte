<script lang="ts">
    import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
    import {
      Button,
      Row,
      Tile
    } from "carbon-components-svelte";

  </script>
  <Row>
    <Tile style="margin-bottom:1%;">
      <Button on:click={()=>{console.log($consensusTipState)}}>Print consensusTipState to console</Button>
    </Tile>
  </Row>
  