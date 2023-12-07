<script lang="ts">
  import { InlineNotification } from "carbon-components-svelte";
import { onDestroy } from "svelte";
  import { linear as easing } from "svelte/easing";
  import { tweened } from "svelte/motion";
  import { fly } from "svelte/transition";

  export let endBlock: number = 0;
  export let endUnix: number = 0;
  export let message: string = "";

  let now = Date.now();
  let countdown = endUnix - now;

  console.log("now", now, "endUnix", endUnix, "countdown", countdown);

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
{#if countdown > 0}
<main>
  <svg in:fly={{ y: -10 }} viewBox="-50 -18 100 20">
    <g
      fill="currentColor"
      text-anchor="middle"
      dominant-baseline="baseline"
      font-size="13"
    >
      <text x="-6" y="0">
        {#each Object.entries({ h, m, s }) as [key, value], i}
          {#if countdown >= 60 ** (2 - i)}
            <tspan dx="3" font-weight="bold">{padValue(value)}</tspan><tspan
              dx="0.5"
              font-size="7">{key}</tspan
            >
          {/if}
        {/each}
      </text>
    </g>
  </svg>
</main>
{:else}
<InlineNotification title="TIME IS UP" subtitle="the person who claimed this problem has not submitted a solution, anyone else can now override their claim and work on it"/>
{/if}


<style>
  main > svg {
    width: 100%;
    height: auto;
    display: block;
  }

  div {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
