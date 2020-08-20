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
        @apply ml-1;
        @apply mt-1;
        @apply whitespace-no-wrap;
        @apply overflow-hidden;
    }

    .base:first-child {
        @apply ml-0;
    }

    /* The following classes are prefixed because they are dynamic and need to be global */
    :global(.tag-yellow) {
        @apply bg-yellow-400;
        @apply text-yellow-900;
    }
    :global(.tag-pink) {
        @apply bg-pink-400;
        @apply text-pink-900;
    }
    :global(.tag-red) {
        @apply bg-red-400;
        @apply text-red-900;
    }
    :global(.tag-orange) {
        @apply bg-orange-400;
        @apply text-orange-900;
    }
    :global(.tag-indigo) {
        @apply bg-indigo-400;
        @apply text-indigo-900;
    }
    :global(.tag-purple) {
        @apply bg-purple-400;
        @apply text-purple-900;
    }
    :global(.tag-blue) {
        @apply bg-blue-400;
        @apply text-blue-900;
    }
    :global(.tag-teal) {
        @apply bg-teal-400;
        @apply text-teal-900;
    }
    :global(.tag-green) {
        @apply bg-green-400;
        @apply text-green-900;
    }
</style>

<script lang="ts">
    import { tick } from 'svelte';
    import type { ColorName } from './Colors';
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
    export let color: ColorName;
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
        class="{`base tag-${color} resizable`}"
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
    <div class="{`base tag-${color} inner`}" bind:this="{wrapper}">
        <slot name="full" />
    </div>
{:else}
    <div class="{`base tag-${color} w-4`}" bind:this="{wrapper}">
        <slot name="compact" />
    </div>
{/if}
