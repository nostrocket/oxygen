<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { Column, Row, Tag, Tile } from "carbon-components-svelte";
  import { ParentChild, XAxis } from "carbon-icons-svelte";
  import { rootProblem } from "../../settings";
  import ChatLayoutProblemHome from "./ChatLayoutProblemHome.svelte";
  export let selected: Problem;

  function getParents(pr: Problem) {
    let parentSet = new Set<Problem>();
    if (pr.UID == rootProblem) {
      parentSet.add(pr);
    }
    for (let p of pr.Parents) {
      let parentProblem = $consensusTipState.Problems.get(p);
      if (parentProblem) {
        parentSet.add(parentProblem);
      }
    }
    return [...parentSet];
  }
</script>

<Row>
  <Column noGutter lg={16}>
    {#each getParents(selected) as p}
      <Tile
        on:click={() => {
          goto(`${base}/problems/${p.UID}`);
        }}
        light={selected.UID == p.UID}
        style="cursor:pointer;padding:6px;color:steelblue;font-weight:bold;"
        ><h4>{p.Title}</h4>
        <p>{p.Summary}</p>

        <!-- <Tag style="display:inline-block;float:right;" size="sm"
          ><ParentChild />{p.Children.size}</Tag
        > -->
      </Tile>
    {/each}
  </Column></Row
>
<Row
  ><Column noGutter lg={4}>
    {#each getParents(selected) as p}
      {#each p.FullChildren as c}
        <Tile
          on:click={() => {
            goto(`${base}/problems/${c.UID}`);
          }}
          light={selected.UID == c.UID}
          style="cursor:pointer;margin-top:2px;padding:6px;"
          >{c.Title}
          {#if c.Children.size > 0}<Tag style="float:right;" size="sm"
              ><ParentChild />{c.Children.size}</Tag
            >{/if}
        </Tile>
      {/each}
    {/each}
  </Column>

  <Column noGutter lg={12}>
    <ChatLayoutProblemHome {selected} />
    {#each selected.FullChildren as c}
      <Tile
        on:click={() => {
          goto(`${base}/problems/${c.UID}`);
        }}
        light={selected.UID == c.UID}
        style="cursor:pointer;margin-left:2px;margin-top:2px;padding:6px;"
        ><XAxis />{c.Title}</Tile
      >
    {/each}
  </Column>
</Row>
