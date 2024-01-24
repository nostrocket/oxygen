<script lang="ts">
  import { onMount } from "svelte";
  import ViewAllRockets from "../../components/rockets/ViewAllRockets.svelte";
  import { BreadCrumb, Crumb } from "$lib/stores/hot_resources/breadcrumb";
  import { base } from "$app/paths";
  onMount(()=>{
    BreadCrumb.update(b=>{
      let c = [new Crumb("Home", `${base}/`)]
      c.push(new Crumb("rockets", `${base}/rockets`))
      return c
    })
  })
</script>
<ViewAllRockets />
