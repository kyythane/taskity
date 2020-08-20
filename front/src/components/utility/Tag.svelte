<style>
    .resizable {
        transition: width 200ms ease-in-out;
        min-width: 1rem;
    }

    .inner {
        width: fit-content;
    }

    .base {
        @apply inline-block;
        @apply text-center;
        @apply leading-4;
        @apply object-contain;
        @apply rounded-full;
        @apply text-sm;
        @apply h-4;
        @apply m-1;
        @apply whitespace-no-wrap;
        @apply overflow-hidden;
    }

    :global(.yellow) {
        @apply bg-yellow-400;
        @apply text-yellow-900;
    }
    :global(.pink) {
        @apply bg-pink-400;
        @apply text-pink-900;
    }
    :global(.red) {
        @apply bg-red-400;
        @apply text-red-900;
    }
    :global(.orange) {
        @apply bg-orange-400;
        @apply text-orange-900;
    }
    :global(.indigo) {
        @apply bg-indigo-400;
        @apply text-indigo-900;
    }
    :global(.purple) {
        @apply bg-purple-400;
        @apply text-purple-900;
    }
    :global(.blue) {
        @apply bg-blue-400;
        @apply text-blue-900;
    }
    :global(.teal) {
        @apply bg-teal-400;
        @apply text-teal-900;
    }
    :global(.green) {
        @apply bg-green-400;
        @apply text-green-900;
    }
</style>

<script lang="ts">
    import { tick, onMount } from 'svelte';
    export let type: 'compact' | 'full' | 'expanding' = 'compact';
    let size: 'compact' | 'full';
    $: {
        switch (type) {
            case 'compact':
                size = 'compact';
                break;
            case 'full':
                size = 'full';
                break;
            case 'expanding':
                size = 'compact';
                break;
        }
    }
    export let color:
        | 'yellow'
        | 'pink'
        | 'red'
        | 'orange'
        | 'indigo'
        | 'purple'
        | 'blue'
        | 'teal'
        | 'green';
    let wrapper: HTMLDivElement | undefined;
    let innerWidth: number = 0;

    const expand = () => {
        if (type === 'expanding') {
            setSize('full');
        }
    };

    const collapse = () => {
        if (type === 'expanding') {
            setSize('compact');
        }
    };
    const setSize = async (newSize: 'compact' | 'full') => {
        size = newSize;
        if (size === 'compact') {
            wrapper!.style.width = '1rem';
        } else {
            await tick();
            wrapper!.style.width = `${innerWidth}px`;
        }
    };
</script>

{#if type === 'expanding'}
    <div
        on:mousemove="{expand}"
        on:mouseleave="{collapse}"
        class="{`base ${color} resizable`}"
        bind:this="{wrapper}"
    >
        <div class="inner" bind:clientWidth="{innerWidth}">
            {#if size === 'compact'}
                <slot name="compact" />
            {:else}
                <slot name="full" />
            {/if}
        </div>
    </div>
{:else if type === 'full'}
    <div class="{`base ${color} inner`}" bind:this="{wrapper}">
        <slot name="full" />
    </div>
{:else}
    <div class="{`base ${color} w-4`}" bind:this="{wrapper}">
        <slot name="compact" />
    </div>
{/if}
