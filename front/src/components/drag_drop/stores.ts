import { writable, Writable } from 'svelte/store';


export type Item = { id: string };
export type HoverResult = { index: number, item: Item, element: HTMLDivElement, placement: 'before' | 'after' };
export type DropCallback = (dragTarget: HoverResult | undefined) => void;
export type HoverCallback = () => HoverResult | undefined;
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
    dragLeave: () => void
};
export type DragTarget = { key?: string, item: Item, controllingDropZoneId: number, sourceRect: Rect, dragElement: HTMLDivElement, cachedRect: Rect };

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