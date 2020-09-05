<style>
    .default {
        cursor: grab;
    }

    .disabled {
        cursor: not-allowed;
    }
</style>

<script lang="ts">
    import type { Id, DropTarget } from './types';
    import { dropTargets } from './stores';

    export let itemId: Id;
    export let disabled: boolean = false;

    let dropZone: DropTarget;

    $: {
        dropZone = $dropTargets.find((target) => target.hasItem(itemId));
    }
</script>

<div
    id="{`reactive-dnd-drag-handle-${itemId}`}"
    on:mousedown="{(event) => {
        if (!disabled && !!dropZone) {
            dropZone.getEventHandlers().handleMouseDown(event, itemId);
        }
    }}"
    on:mouseup="{(event) => {
        if (!!dropZone) {
            dropZone.getEventHandlers().handleMouseUp(event);
        }
    }}"
    on:mousemove="{(event) => {
        if (!!dropZone) {
            dropZone.getEventHandlers().handleMouseMove(event);
        }
    }}"
    class="{disabled ? 'disabled' : 'default'}"
>
    <slot />
</div>
