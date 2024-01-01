<script>
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import LogNewFaq from "../../components/FAQ/LogNewFAQ.svelte";
  import LoginButtonWithError from "../../components/elements/LoginButtonWithError.svelte";

</script>
<h2>FAQ</h2>
{#if !currentUser}<LoginButtonWithError reason="log a new FAQ" />{/if}
<LogNewFaq />