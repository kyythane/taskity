<script lang="ts">
    import type { Item, DragEventHandlers, DropTarget } from './stores';
    import { dropTargets } from './stores';

    export let item: Item;
    let dropZone: DropTarget;

    $: {
        dropZone = $dropTargets.find((target) => target.hasItem(item));
    }
</script>

<div
    on:mousedown="{(event) => dropZone
            ?.getEventHandlers()
            .handleMouseDown(event, item)}"
    on:mouseup="{dropZone?.getEventHandlers().handleMouseUp}"
    on:mousemove="{dropZone?.getEventHandlers().handleMouseMove}"
>
    <slot />
</div>
