<script>
  import { page } from "$app/stores";
  import { rocketMap } from "$lib/state";
  import { AspectRatio, Column, Loading, Row, Tile, breakpointObserver } from "carbon-components-svelte";
  let rockets = new Map
  let size = breakpointObserver()
  $: {
    console.log("breakpoint: "+$size)
    console.log($rocketMap[$page.params.id])
    // Object.keys($rocketMap).forEach(r => {
    //   rockets.set(r, $rocketMap[r])
    // })
    // console.log(rockets)
  }
</script>

<div>
  {#if $rocketMap[$page.params.id]}
  <h2>{$rocketMap[$page.params.id].Name}</h2>
  <p>Created by: {$rocketMap[$page.params.id].CreatedBy}</p>
  <Row>
    <Column sm={16} md={16} lg={16} max={8}><AspectRatio ratio="2x1" style="margin:1px"><Tile style="height:100%; width:100%;"><h3>Latest Problems</h3></Tile></AspectRatio></Column>
    <Column sm={16} md={16} lg={16} max={8}><AspectRatio ratio="2x1" style="margin:1px"><Tile style="height:100%; width:100%;"><h3>Latest Products</h3></Tile></AspectRatio></Column>
    <Column sm={16} md={16} lg={16} max={8}><AspectRatio ratio="2x1" style="margin:1px"><Tile style="height:100%; width:100%;"><h3>Latest Merit Approvals</h3></Tile></AspectRatio></Column>
    <Column sm={16} md={16} lg={16} max={8}><AspectRatio ratio="2x1" style="margin:1px"><Tile style="height:100%; width:100%;"><h3>Latest Revenue</h3></Tile></AspectRatio></Column>
  </Row>
  {:else}
  <Loading />
  <p>Searching for Rocket: {$page.params.id}</p>
  {/if}
</div>
