<script lang="ts">
  import { InlineLoading } from "carbon-components-svelte";

  let cuckPrice: number | undefined = undefined;
  export let sats = 0;
  $: {
    if (!cuckPrice) {
      getCuckPrice();
    }
  }

  function getCuckPrice() {
    try {
      var url = "https://api.coindesk.com/v1/bpi/currentprice.json";
      var symbol = "USD";
      fetch(url)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          cuckPrice = parseFloat(data.bpi[symbol].rate.replace(/,/g, ""));
        });
    } catch {}
  }
</script>

{#if cuckPrice}
  (approximately <span style="font-weight: bold;"
    >${((sats / 100000000) * cuckPrice).toFixed(2)}</span
  > in CuckLoserBucks)
{/if}
