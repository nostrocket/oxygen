<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import type { Problem } from "$lib/stores/nostrocket_state/types";
  import { Column, Row, Tag, TextInput, Tile } from "carbon-components-svelte";
  import { Category, Chat, YAxis } from "carbon-icons-svelte";
  import { rootProblem } from "../../settings";
  import ChatLayoutProblemHome from "./ChatLayoutProblemHome.svelte";
  export let selected: Problem;

  function getParents(pr: Problem) {
    let parentSet = new Set<Problem>();
    for (let p of pr.Parents) {
      let parentProblem = $consensusTipState.Problems.get(p);
      if (parentProblem) {
        parentSet.add(parentProblem);
      }
    }
    return [...parentSet];
  }

  $: parentsOfSelected = getParents(selected);

  $: hover = "";
  $: width = 0;
</script>

<Row>
  <Column noGutter lg={16}>
    {#each parentsOfSelected as p}
      <Tile>
        <span
          style="cursor:pointer;font-weight:300;"
          on:click={() => {
            goto(`${base}/problems/${p.UID}`);
          }}><YAxis /> {p.Title}</span
        >

        <!-- <Tag style="display:inline-block;float:right;" size="sm"
          ><ParentChild />{p.Children.size}</Tag
        > -->
      </Tile>
    {/each}
  </Column></Row
>
<Row>
  <Column noGutter lg={16}>
    <div
      bind:clientWidth={width}
      style="overflow:auto;border-left:solid;border-width:10px;border-color:#262626;padding-left:2px;"
    >
      <!-- <div style="height:100%;width:10px;float:left;"></div> -->
      <div style="width:100%;float:right;">
        <Tile style="margin-top:2px;">
          <TextInput
            placeholder="Start typing... //todo: levenshtein filter => log new problem"
          /></Tile
        >
        {#if selected.UID == rootProblem}
          <ChatLayoutProblemHome {selected} />
        {/if}
        {#each getParents(selected) as p}
          {#each p.FullChildren as c}
            {#if c.UID == selected.UID}
              <ChatLayoutProblemHome {selected} />
            {:else}
              <Tile
                on:click={() => {
                  goto(`${base}/problems/${c.UID}`);
                }}
                on:mouseenter={() => {
                  hover = c.UID;
                }}
                on:mouseleave={() => {
                  hover = "";
                }}
                light={hover == c.UID}
                style="cursor:pointer;margin-top:2px;padding:6px;"
              >
                {c.Title}
                {#if c.Children.size > 0}<Tag type="purple"
                    ><Category />{c.Children.size}</Tag
                  >{/if}
                {#if c.NumberOfComments > 0}<Tag type="cyan" icon={Chat}
                    >{c.NumberOfComments}</Tag
                  >{/if}
              </Tile>
            {/if}
          {/each}
        {/each}
      </div>
    </div>
  </Column>
</Row>
<style></style>
