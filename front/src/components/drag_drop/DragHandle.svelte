<style>
    .default {
        cursor: grab;
    }

    .disabled {
        cursor: not-allowed;
    }
</style>

<script lang="ts">
    import type { Id, DropTarget } from './stores';
    import { dropTargets } from './stores';

    export let itemId: Id;
    export let disabled: boolean = false;

    let className: string = 'default';
    let dropZone: DropTarget;

    $: {
        dropZone = $dropTargets.find((target) => target.hasItem(itemId));
    }

    $: {
        if (disabled) {
            className = 'disabled';
        } else {
            className = 'default';
        }
    }
</script>

<div
    id="{`reactive-dnd-drag-handle-${itemId}`}"
    on:mousedown="{(event) => {
        if (!disabled) {
            dropZone?.getEventHandlers().handleMouseDown(event, itemId);
        }
    }}"
    on:mouseup="{dropZone?.getEventHandlers().handleMouseUp}"
    on:mousemove="{dropZone?.getEventHandlers().handleMouseMove}"
    class="{className}"
>
    <slot />
</div>
