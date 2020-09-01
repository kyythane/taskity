<script lang="ts">
    import type { DragEventHandlers, DropTarget } from './stores';
    import { dropTargets } from './stores';

    export let itemId: string;
    let dropZone: DropTarget;

    $: {
        dropZone = $dropTargets.find((target) => target.hasItem(itemId));
    }
</script>

<div
    on:mousedown="{(event) => dropZone
            ?.getEventHandlers()
            .handleMouseDown(event, itemId)}"
    on:mouseup="{dropZone?.getEventHandlers().handleMouseUp}"
    on:mousemove="{dropZone?.getEventHandlers().handleMouseMove}"
>
    <slot />
</div>
