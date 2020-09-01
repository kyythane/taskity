<script lang="ts">
    import type { Id, DropTarget } from './stores';
    import { dropTargets } from './stores';

    export let itemId: Id;
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
