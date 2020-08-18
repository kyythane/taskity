<script lang="ts">
    import { layout, url } from '@sveltech/routify';
</script>

<nav>
    {#each $layout.children as node}
        <a href="{$url(node.path)}">{node.title}</a>
        <!-- uncomment for recursive links <svelte:self {node} /> -->
    {/each}
</nav>
