<script>
  import {
    Column,
    Content,
    Grid,
    Row,
    Tile,
    breakpointObserver,
  } from "carbon-components-svelte";
  import "carbon-components-svelte/css/g100.css";
  import Header from "./Header.svelte";
  import "./styles.css";
  import { onMount } from "svelte";
  import { loginNip07 } from "$lib/stores/event_sources/relays/ndk";
  let size = breakpointObserver();
  $: {
    console.log("breakpoint: " + $size);
  }
onMount(()=>{
  loginNip07(false)
})
</script>
<svelte:head>
  <title>Nostrocket</title>
</svelte:head>

<Header />

<Content>
  <Grid fullWidth>
    <Row>
      <Column>
        <slot />
      </Column>
    </Row>
    <br />
    <Row condensed>
      <div
        style="width:100%;height:40px;overflow:hidden;position:relative;left:0;bottom:0;text-align:right;padding-right:1%;"
      >
        <Tile style="width:100%;">
          <a
            href="https://satellite.earth/n/nostrocket"
            target="_blank"
            rel="noopener noreferrer">/n/nostrocket</a
          >
          |
          <a
            href="https://github.com/nostrocket"
            target="_blank"
            rel="noopener noreferrer">GitHub</a
          >
          |
          <a
            href="https://t.me/nostrocket"
            target="_blank"
            rel="noopener noreferrer">Telegram Group</a
          >
        </Tile>
      </div>
    </Row>
  </Grid>
</Content>
