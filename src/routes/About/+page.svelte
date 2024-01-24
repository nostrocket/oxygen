<script>
  import { BreadCrumb, Crumb } from "$lib/stores/hot_resources/breadcrumb";
  import { onMount } from "svelte";
  import Landing from "../../components/views/Landing.svelte";
  import { base } from "$app/paths";
  onMount(()=>{
    BreadCrumb.update(b=>{
      let c = [new Crumb("Home", `${base}/`)]
      c.push(new Crumb("rockets", `${base}/About`))
      b = c
      return b
    })
  })
</script>
<Landing />