<script lang="ts">
    import type { CardData } from './CardData';
    import TaskCard from './TaskCard.svelte';
    import DropList from '../drag_drop/DropList.svelte';
    export let columnData: Array<CardData> = [];
    export let columnTitle: string;
    export let disabled: boolean = false;
    export let key: string | undefined = undefined;
</script>

<!-- <section class="rounded-md border-2 border-gray-900 h-full w-64 bg-gray-100"> -->
<section class="rounded-md border-2 border-gray-900 h-48 w-full bg-gray-100">
    {#if columnTitle}
        <h2>{columnTitle}</h2>
    {/if}
    <DropList
        items="{columnData}"
        on:itemdroppedin
        on:itemdraggedout
        {disabled}
        {key}
        enableResizeListeners
        direction="horizontal"
    >
        <div
            slot="listItem"
            let:data="{{ item, isDraggingOver, dragEventHandlers }}"
        >
            <!-- <div
                style="{`${isDraggingOver ? 'border: 1rem solid blue;' : ''}`}"
            > -->
            <TaskCard cardData="{item}" />
            <!-- </div> -->

        </div>
    </DropList>
</section>

<!-- on:mousedown="{(event) => dragEventHandlers.handleMouseDown(event, item)}"
                on:mouseup="{dragEventHandlers.handleMouseUp}"
                on:mousemove="{dragEventHandlers.handleMouseMove}" -->
