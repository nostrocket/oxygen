<script lang="ts">
    let cuckPrice:number|undefined = undefined
    export let sats = 0
  $: {
    if (!cuckPrice) {
      getCuckPrice();
    }
  }

  function getCuckPrice() {
    var url = "https://api.coindesk.com/v1/bpi/currentprice.json";
    var symbol = "USD";
    fetch(url)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        cuckPrice = parseFloat(data.bpi[symbol].rate.replace(/,/g, ""));
      });
  }

</script>
{#if cuckPrice}
Approximately <span style="font-weight: bold;"
>${((sats / 100000000) * cuckPrice).toFixed(
  2
)}</span
> in cuckloserbucks
{/if}