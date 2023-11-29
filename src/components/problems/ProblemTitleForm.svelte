<script lang="ts">
  import { InlineNotification, TextInput } from "carbon-components-svelte";

  export let text: string = ""
  let titleError = "";
  let titleInvalid = false;

  $: {
    if (text.length < 10) {
            titleInvalid = true;
            titleError =
                text.length.toString() +
                " characters isn't big enough for anyone...";
        } else {
            titleInvalid = false;
            titleError = "";
        }
  }
</script>
<p>Summarize the problem in one short sentence.</p>
<p>
  <InlineNotification
  kind="info-square"
  title="Good to know:"
  subtitle="To let the community know you understand how the Nostrocket process works, begin your title with Problem:"
/>
  
</p>

<TextInput
  invalid={titleInvalid}
  invalidText={titleError}
  bind:value={text}
  maxlength={100}
  placeholder="Problem: "
  style="margin-bottom:1%;"
/>
