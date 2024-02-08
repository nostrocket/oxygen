<script lang="ts">
  import { InlineNotification, Tag } from "carbon-components-svelte";
  import { onDestroy } from "svelte";
  import { linear as easing } from "svelte/easing";
  import { tweened } from "svelte/motion";
  import { fly } from "svelte/transition";
  import CommentUser from "../comments/CommentUser.svelte";
  import type { Problem } from "$lib/stores/nostrocket_state/types";

  export let endBlock: number = 0;
  export let endUnix: number = 0;
  export let claimedByPubkey: string | undefined = undefined;
  export let problem:Problem|undefined = undefined;

  $:hide = false;

  $: {
    if (problem) {
      endUnix=(problem.ClaimedAt + 259200) * 1000
      claimedByPubkey = problem.ClaimedBy
      if (problem.Status != "claimed") {
        hide = true;
      }
    }
  }

  let now = Date.now();
  $: countdown = endUnix - now;

  $: count = Math.round((endUnix - now) / 1000);
  $: h = Math.floor(count / 3600);
  $: m = Math.floor((count - h * 3600) / 60);
  $: s = count - h * 3600 - m * 60;

  function updateTimer() {
    now = Date.now();
  }

  let interval = setInterval(updateTimer, 1000);
  $: if (count === 0) clearInterval(interval);

  const duration = 1000;

  let offset = tweened(1, { duration, easing });
  let rotation = tweened(360, { duration, easing });

  $: offset.set(Math.max(count - 1, 0) / countdown);
  $: rotation.set((Math.max(count - 1, 0) / countdown) * 360);

  function padValue(value, length = 2, char = "0") {
    const { length: currentLength } = value.toString();
    if (currentLength >= length) return value.toString();
    return `${char.repeat(length - currentLength)}${value}`;
  }

  onDestroy(() => {
    clearInterval(interval);
  });
</script>
{#if !hide}
{#if countdown > 0}
<Tag style="margin:4px;" type="magenta" size="sm">TIME REMAINING: 
  <main>
    <svg in:fly={{ y: -10 }} viewBox="-37 -11 80 14">
      <g
        fill="currentColor"
        text-anchor="middle"
        dominant-baseline="baseline"
        font-size="13"
      >
        <text x="0" y="0">
          {#each Object.entries({ h, m, s }) as [key, value], i}
            {#if countdown >= 60 ** (2 - i)}
              <tspan dx="3" font-weight="bold">{padValue(value)}</tspan><tspan
                dx="0.5"
                font-size="10">{key}</tspan
              >
            {/if}
          {/each}
        </text>
      </g>
    </svg>
  </main>
</Tag>
{:else}
  <InlineNotification kind="info-square" lowContrast title="TIME IS UP"
    ><p>
      {#if claimedByPubkey}<CommentUser pubkey={claimedByPubkey} />{:else}the
        person who claimed this problem{/if} has not produced a solution or requested more time, anyone
      else can now override their claim and work on it
    </p></InlineNotification
  >
{/if}
{/if}
<style>
  main > svg {
    width: 120px;
    height: auto;
    display: block;
  }

  div {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
