<style>
    .resizable {
        transition: width 200ms ease-in-out;
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
    export let text: string = 'A long label';
    export let size: 'compact' | 'full' = 'compact';
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
    let initial = text.length > 0 ? text[0] : '';
</script>

<div
    on:mouseover="{() => (size = 'full')}"
    on:mouseout="{() => (size = 'compact')}"
    class="{`text-center leading-4 object-contain rounded-full text-sm ${size === 'compact' ? 'w-4' : 'w-24'} h-4 m-1 ${color} resizable whitespace-no-wrap overflow-hidden`}"
>
    {size === 'compact' ? initial : text}
</div>
