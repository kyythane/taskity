<style>
    :global(.yellow) {
        @apply bg-yellow-400;
        @apply text-yellow-700;
    }
    :global(.pink) {
        @apply bg-pink-400;
        @apply text-pink-700;
    }
    :global(.red) {
        @apply bg-red-400;
        @apply text-red-700;
    }
    :global(.orange) {
        @apply bg-orange-400;
        @apply text-orange-700;
    }
    :global(.indigo) {
        @apply bg-indigo-400;
        @apply text-indigo-700;
    }
    :global(.purple) {
        @apply bg-purple-400;
        @apply text-purple-700;
    }
    :global(.blue) {
        @apply bg-blue-400;
        @apply text-blue-700;
    }
    :global(.teal) {
        @apply bg-teal-400;
        @apply text-teal-700;
    }
    :global(.green) {
        @apply bg-green-400;
        @apply text-green-700;
    }
</style>

<script lang="ts">
    export let text: string = '!';
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
    class="{`text-center leading-4 object-contain rounded-full text-sm ${size === 'compact' ? 'w-4' : 'w-16'} h-4 m-1 ${color}`}"
>
    {size === 'compact' ? initial : text}
</div>
