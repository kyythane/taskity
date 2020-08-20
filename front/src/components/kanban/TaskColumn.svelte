<script lang="ts">
    import { dndzone } from 'svelte-dnd-action';
    import { flip } from 'svelte/animate';
    import TaskCard from './TaskCard.svelte';
    import type { CardData } from './CardData';
    const flipDurationMs = 300;

    export let columnData: Array<CardData> = [];
    export let columnTitle: string;
    function handleDndConsider(e) {
        columnData = e.detail.items;
    }
    function handleDndFinalize(e) {
        columnData = e.detail.items;
    }
</script>

<section
    class="rounded-md border-2 border-gray-900 overflow-y-scroll h-full w-64
    bg-gray-100"
>
    {#if columnTitle}
        <h2>{columnTitle}</h2>
    {/if}
    <div
        use:dndzone="{{ items: columnData, flipDurationMs }}"
        on:consider="{handleDndConsider}"
        on:finalize="{handleDndFinalize}"
        class="overflow-y-scroll h-full w-full overscroll-contain"
    >
        {#each columnData as cardData (cardData.id)}
            <div animate:flip="{{ duration: flipDurationMs }}">
                <TaskCard {cardData} />
            </div>
        {/each}
    </div>
</section>
