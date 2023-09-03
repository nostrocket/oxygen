<script lang="ts">
  import ProductCard from "./ProductCard.svelte";
  export let rocketInfo;

  const products = rocketInfo.Products;
</script>

{#if products}
  {#each products as p, index}
    <ProductCard {rocketInfo} {p} />
  {/each}
{/if}
