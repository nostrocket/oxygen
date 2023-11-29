<script lang="ts">
  import { TextArea } from "carbon-components-svelte";

  export let text:string|undefined = undefined

</script>
<p>
  Capture the critical aspects of the problem in a way that
  people can understand the scope at a quick glance.
</p>

<TextArea
bind:value={text}
maxlength={280}
placeholder="Use one paragraph to summarize the problem you face or have observed. MUST be plaintext, no markdown. Max 280 characters."
style="margin-bottom:1%;"
/>