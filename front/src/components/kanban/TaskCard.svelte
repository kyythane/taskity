<script lang="ts">
    import type { CardData } from './CardData';
    import { fade } from 'svelte/transition';
    import Tag from '../utility/Tag.svelte';
    let type: 'compact' | 'expanding' = 'compact';
    export let cardData: CardData;
</script>

<svelte:options immutable />
<div
    on:mouseover="{() => (type = 'expanding')}"
    on:mouseleave="{() => (type = 'compact')}"
    class="rounded-md h-32 w-64 bg-white p-4 mt-2"
>
    <h3>{cardData.title}</h3>
    <div class="flex flex-wrap w-64 p-2">
        <Tag color="pink" {type}>
            <p
                slot="full"
                class="mr-2 ml-2 cursor-pointer"
                transition:fade="{{ duration: 200 }}"
            >
                Category 1
            </p>
        </Tag>
        <Tag color="yellow" {type}>
            <p
                slot="full"
                class="mr-2 ml-2 cursor-pointer"
                transition:fade="{{ duration: 200 }}"
            >
                Category 2
            </p>
        </Tag>
        <Tag color="green" {type}>
            <p
                slot="full"
                class="mr-2 ml-2 cursor-pointer"
                transition:fade="{{ duration: 200 }}"
            >
                Category 3
            </p>
        </Tag>
        <Tag color="indigo" {type}>
            <p
                slot="full"
                class="mr-2 ml-2 cursor-pointer"
                transition:fade="{{ duration: 200 }}"
            >
                Category 4
            </p>
        </Tag>
        <Tag color="purple" {type}>
            <p
                slot="full"
                class="mr-2 ml-2 cursor-pointer"
                transition:fade="{{ duration: 200 }}"
            >
                Category 5
            </p>
        </Tag>
    </div>
</div>
