<script lang="ts">
  import { loginNip07 } from "$lib/stores/event_sources/relays/ndk";
  import { notifications } from "$lib/stores/hot_resources/notifications";
  import {
    Column,
    Content,
    Grid,
    Row,
    Tile,
    ToastNotification,
  } from "carbon-components-svelte";
  import "carbon-components-svelte/css/g100.css";
  import { onMount } from "svelte";
  import Header from "./Header.svelte";
  import "./styles.css";
  onMount(() => {
    loginNip07(false);
  });
</script>

<svelte:head>
  <title>Nostrocket</title>
</svelte:head>

<Header />

<Content>
  <Grid fullWidth noGutter>
    <Column noGutter>
      <!-- <Breadcrumb>
        {#each $BreadCrumb as crumb}
        <BreadcrumbItem style="cursor:pointer" on:click={()=>{goto(`${crumb.Path}`); console.log({crumb})}}>{crumb.Name}</BreadcrumbItem>
        {/each}
      </Breadcrumb> -->
      <slot />
      {#if $notifications.length > 0}{#each $notifications as n}<ToastNotification
            kind="info-square"
            lowContrast
            title="INFO"
            subtitle={n}
            on:close={(e) => {}}
          />{/each}{/if}
      <Row>
        <div
          style="width:100%;height:30px;overflow:hidden;position:relative;left:0;bottom:0;text-align:right;padding-right:1%;"
        >
          <Tile
            style="margin-top:10px;width:100%;padding:3px;padding-right:10px;"
          >
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
    </Column>
  </Grid>
</Content>
