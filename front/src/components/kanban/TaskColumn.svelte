<script lang="ts">
    import type { CardData } from './CardData';
    import TaskCard from './TaskCard.svelte';
    import DragList from '../drag_drop/DragList.svelte';
    export let columnData: Array<CardData> = [];
    export let columnTitle: string;
    export let disabled: boolean = false;
</script>

<section
    class="rounded-md border-2 border-gray-900 overflow-y-scroll h-full w-64
    bg-gray-100"
>
    {#if columnTitle}
        <h2>{columnTitle}</h2>
    {/if}
    <DragList
        items="{columnData}"
        on:itemdroppedin
        on:itemdraggedout
        {disabled}
    >
        <div
            slot="listItem"
            let:data="{{ item, handleMouseDown, handleMouseUp, handleMouseMove }}"
        >
            <TaskCard
                cardData="{item}"
                on:mousedown="{(event) => handleMouseDown(event, item)}"
                on:mouseup="{handleMouseUp}"
                on:mousemove="{handleMouseMove}"
            />
        </div>
    </DragList>
</section>
