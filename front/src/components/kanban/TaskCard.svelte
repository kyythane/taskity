<script lang="ts">
    import { fade } from 'svelte/transition';
    import { selectedTasks } from './stores';
    import type { CardData } from './CardData';
    import Tag from '../utility/Tag.svelte';
    import DragHandle from '../drag_drop/DragHandle.svelte';
    let hovered: boolean = false;
    let checked: boolean = false;
    export let cardData: CardData;

    const onMouseIn = () => {
        hovered = true;
    };

    const onMouseOut = () => {
        hovered = false;
    };

    $: {
        if (checked) {
            selectedTasks.update((selectedTasks) => [
                ...selectedTasks,
                cardData.id,
            ]);
        } else {
            selectedTasks.update((selectedTasks) =>
                selectedTasks.filter((taskId) => taskId !== cardData.id)
            );
        }
    }
</script>

<svelte:options immutable="{true}" />

<div
    on:mousedown
    on:mouseup
    on:mousemove
    on:mouseover="{onMouseIn}"
    on:mouseleave="{onMouseOut}"
    class="rounded-md h-32 w-64 bg-white p-4 ml-2"
>
    {#if $selectedTasks.length > 0 || hovered}
        <input
            type="checkbox"
            bind:checked
            transition:fade="{{ duration: 200 }}"
        />
    {/if}
    <h3>{cardData.title}</h3>
    <div class="flex flex-wrap w-64 mt-1">
        {#each cardData.labels as label (label.id)}
            <Tag
                color="{label.color}"
                type="{hovered ? 'expanding' : 'compact'}"
            >
                <p
                    slot="full"
                    class="mr-2 ml-2 cursor-pointer"
                    transition:fade="{{ duration: 200 }}"
                >
                    {label.text}
                </p>
            </Tag>
        {/each}
    </div>
    <DragHandle itemId="{cardData.id}">
        <button>HANDLE</button>
    </DragHandle>
</div>
