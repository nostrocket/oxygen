<script>
  import { page } from "$app/stores";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import {
    AspectRatio,
    CodeSnippet,
    Column,
    Loading,
    Row,
    Tile,
  } from "carbon-components-svelte";
</script>

<div>
  {#if $consensusTipState.RocketMap.get($page.params.id)}
    <h2>
      ROCKET: {$consensusTipState.RocketMap.get(
        $page.params.id
      )?.Name.toLocaleUpperCase()}
    </h2>
    <Row>
      <Column sm={16} md={16} lg={16} max={8}
        ><AspectRatio ratio="2x1" style="margin:1%;"
          ><Tile style="height:100%; width:100%;">
            <CodeSnippet
              type="multi"
              code={JSON.stringify(
                $consensusTipState.RocketMap.get($page.params.id)?.Event,
                null,
                "\t"
              )}
              expanded
            />
          </Tile></AspectRatio
        ></Column
      >
      <Column sm={16} md={16} lg={16} max={8}
        ><AspectRatio ratio="2x1" style="margin:1%;"
          ><Tile style="height:100%; width:100%;"
            ><h3>About</h3>
            <p>
              Created by: {$consensusTipState.RocketMap.get($page.params.id)
                ?.CreatedBy}
            </p>
            Problem it's solving, mission, description etc</Tile
          ></AspectRatio
        ></Column
      >
      <Column sm={16} md={16} lg={16} max={8}
        ><AspectRatio ratio="2x1" style="margin:1%"
          ><Tile style="height:100%; width:100%;"
            ><h3>Problem Tracker</h3>
            The latest x problems for this rocket</Tile
          ></AspectRatio
        ></Column
      >
      <Column sm={16} md={16} lg={16} max={8}
        ><AspectRatio ratio="2x1" style="margin:1%"
          ><Tile style="height:100%; width:100%;"
            ><h3>
              {$consensusTipState.RocketMap.get($page.params.id)?.Name} Products
            </h3>
            The latest x products that can be purchased from this rocket</Tile
          ></AspectRatio
        ></Column
      >
      <Column sm={16} md={16} lg={16} max={8}
        ><AspectRatio ratio="2x1" style="margin:1%"
          ><Tile style="height:100%; width:100%;"
            ><h3>Merit Approvals</h3>
            The latest merit approvals for work that's been done</Tile
          ></AspectRatio
        ></Column
      >
      <Column sm={16} md={16} lg={16} max={8}
        ><AspectRatio ratio="2x1" style="margin:1%"
          ><Tile style="height:100%; width:100%;"
            ><h3>Merit Distribution & Votepower</h3>
            The current distribution of merits and Votepower within this rocket</Tile
          ></AspectRatio
        ></Column
      >
      <Column sm={16} md={16} lg={16} max={8}
        ><AspectRatio ratio="2x1" style="margin:1%"
          ><Tile style="height:100%; width:100%;"
            ><h3>Revenue</h3>
            A graph of revenue over time in sats, or maybe a list of npubs and the
            amount they've recieved</Tile
          ></AspectRatio
        ></Column
      >
    </Row>
  {:else}
    <Loading />
    <p>Searching for Rocket: {$page.params.id}</p>
  {/if}
</div>
