<script>

  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { page } from "$app/stores";

</script>
{goto(`${base}/nr/${$page.params.rocket}/info`)}