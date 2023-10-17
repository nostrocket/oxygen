<script>
  import ndk from "$lib/stores/events/ndk";
  import { MutexObserver } from "$lib/stores/mutex";
  import {
    Column,
    Content,
    Grid,
    Row,
    Tile,
    breakpointObserver,
  } from "carbon-components-svelte";
  import "carbon-components-svelte/css/g100.css";
  import { onMount } from "svelte";
  import Header from "./Header.svelte";
  import "./styles.css";
  import { ndk_profiles } from "$lib/stores/events/profiles";
  onMount(async () => {
    try {
      $ndk.connect().then(() => {
        console.log("NDK Connected!");
      });
      $ndk_profiles.connect().then(() => {
        console.log("NDK Profiles Connected!");
      });
    } catch (e) {
      console.error(`layout error`, e);
    }
  });
  let size = breakpointObserver();
  $: {
    console.log("breakpoint: " + $size);
  }
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
    <Row condensed noGutter>
      <div
        style="width:100%;height:40px;overflow:hidden;position:relative;left:0;bottom:0;text-align:right;padding-right:1%;"
      >
        <Tile style="width:100%;">
          Visit <a href="https://nostrocket.org">nostrocket.org</a> to learn
          more about Nostrocket. StateChangeMutex is {$MutexObserver
            ? "Locked"
            : "Unlocked"}
        </Tile>
      </div>
    </Row>
  </Grid>
</Content>
