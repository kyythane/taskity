import { writable, Writable } from 'svelte/store';

export type Id = number | string;
export type Item = { id: Id };
export type DragEventHandlers = {
    handleMouseDown: (event: MouseEvent, itemId: Id) => void;
    handleMouseUp: (event: MouseEvent) => void;
    handleMouseMove: (event: MouseEvent) => void;
};
export type HoverResult = { index: number, item: Item, element: HTMLDivElement, placement: 'before' | 'after' };
export type DropCallback = (dragTarget: HoverResult | undefined) => void;
export type HoverCallback = () => HoverResult | undefined;
export type Position = { x: number, y: number };
export type Rect = { x: number, y: number, width: number, height: number };
export type DropTarget = {
    id: number,
    key?: string,
    capacity: number,
    disabled: boolean,
    rect: Rect,
    dropElement: HTMLDivElement,
    dropCallback: DropCallback,
    hoverCallback: HoverCallback,
    enterDropZone: () => void,
    leaveDropZone: () => void,
    hasItem: (itemId: Id) => boolean,
    getEventHandlers: () => DragEventHandlers,
};
export type DragTarget = { key?: string, item: Item, controllingDropZoneId: number, sourceRect: Rect, dragElement: HTMLDivElement, cachedRect: Rect };
export type DragDropSettings = {
    defaults: {
        disableScrollOnDrag: boolean,
        disableDropSpacing: boolean,
        enableResizeListeners: boolean,
        direction: 'horizontal' | 'vertical',
    }
    dragThresholdPixels: number,
    animationMs: number,
    scrollOnDragThresholdPercent: number,
    scrollOnDragMinPixels: number,
    scrollOnDragMaxPixels: number,
};

export const dragDropSettings: Writable<DragDropSettings> = writable({
    defaults: {
        disableScrollOnDrag: false,
        disableDropSpacing: false,
        enableResizeListeners: false,
        direction: 'vertical',
    },
    dragThresholdPixels: 25,
    animationMs: 200,
    scrollOnDragThresholdPercent: 0.1,
    scrollOnDragMinPixels: 50,
    scrollOnDragMaxPixels: 150,
});
export const dropTargets: Writable<Array<DropTarget>> = writable([]);
export const dragging: Writable<'none' | 'picking-up' | 'dragging' | 'returning' | 'dropping'> = writable('none');
export const dragTarget: Writable<DragTarget | undefined> = writable(undefined);
export const dropTargetId = createDropTargetId();

function createDropTargetId() {
    const { subscribe, update } = writable(0);
    return {
        subscribe,
        next: () => {
            let curr = 0;
            update(n => {
                curr = n;
                return n + 1
            });
            return curr;
        }
    };
}