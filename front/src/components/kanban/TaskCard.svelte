<script lang="ts">
    import type { CardData } from './CardData';
    export let cardData: CardData;
</script>

<svelte:options immutable />
<div class="rounded-md, bg-white p-4 mt-2">
    <h3>{cardData.title}</h3>
</div>
