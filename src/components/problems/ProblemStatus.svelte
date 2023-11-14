<script lang="ts">
    export let status: string
    export let color: string = 'white'
</script>

<div style={`display: flex; align-items: center; color: ${color}; font-weight: bold`}>
    <slot />&nbsp; {status}
</div>