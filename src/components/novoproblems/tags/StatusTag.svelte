<script lang="ts">
  import { consensusTipState } from "$lib/stores/nostrocket_state/master_state";
  import { hasOpenChildren } from "$lib/stores/nostrocket_state/soft_state/problems";
    import type { Problem } from "$lib/stores/nostrocket_state/types";


  import { Tag } from "carbon-components-svelte";
  import { AiGovernanceLifecycle } from "carbon-icons-svelte";

  export let problem:Problem;
  export let type: "standard" | "open-children"



function getStatusAndDescription(p:Problem):{color:string, description:string} {
    let problemStatusColor = "green";
    let problemStatusDescription = p.Status;
    switch (p.Status) {
      case "open":
        problemStatusColor = "green";
        break;
      case "claimed":
        problemStatusColor = "magenta";
        problemStatusDescription = "in-progress";
        break;
      case "patched":
        problemStatusColor = "cyan";
        break;
      case "closed":
        problemStatusColor = "red";
        break;
    }
    if (type == "open-children" && p.Status == "open" && hasOpenChildren(p, $consensusTipState)) {
      problemStatusColor = "purple";
      problemStatusDescription = "open children";
    }
    return {color: problemStatusColor, description:problemStatusDescription}
}

</script>
<Tag interactive icon={AiGovernanceLifecycle} type={getStatusAndDescription(problem).color}>{getStatusAndDescription(problem).description}</Tag>