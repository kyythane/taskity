import type { Rect, HoverResult, Position, Id } from "./types";

export function createDebugRender() {
    let canvas = document.getElementsByTagName('canvas')[0];
    if (!!canvas) {
        return canvas.getContext('2d');
    }
    canvas = document.createElement('canvas'); //Create a canvas element
    //Set canvas width/height
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    //Set canvas drawing area width/height
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    //Position canvas
    canvas.style.position = 'absolute';
    canvas.style.left = '0px';
    canvas.style.top = '0px';
    canvas.style.zIndex = '100000';
    canvas.style.pointerEvents = 'none'; //Make sure you can click 'through' the canvas
    document.body.appendChild(canvas); //Append canvas to body element
    return canvas.getContext('2d');
}

export function makeDraggableElement(originalElement: HTMLDivElement, id: Id) {
    const rect = originalElement.getBoundingClientRect();
    const draggedEl = originalElement.cloneNode(true) as HTMLDivElement;
    draggedEl.id = `reactive-dnd-drag-placeholder`;
    draggedEl.style.position = "fixed";
    draggedEl.style.top = `${rect.top}px`;
    draggedEl.style.left = `${rect.left}px`;
    draggedEl.style.zIndex = '9999';
    draggedEl.style.cursor = 'grabbing';
    let dragHandle = draggedEl.querySelector(`#reactive-dnd-drag-handle-${id}`) as HTMLDivElement;
    if (!!dragHandle) {
        dragHandle.style.cursor = 'grabbing';
    }
    return draggedEl;
}

export function overlap(rect1: Rect, rect2: Rect) {
    return !(rect1.x + rect1.width < rect2.x ||
        rect1.y + rect1.height < rect2.y ||
        rect2.x + rect2.width < rect1.x ||
        rect2.y + rect2.height < rect1.y);
}


export function percentOverlap(rect1: Rect, rect2: Rect) {
    let maxX = Math.min(rect1.width + rect1.x, rect2.width + rect2.x);
    let minX = Math.max(rect1.x, rect2.x);
    let maxY = Math.min(rect1.height + rect1.y, rect2.height + rect2.y);
    let minY = Math.max(rect1.y, rect2.y);
    return { overlapX: Math.max(maxX - minX, 0) / rect1.width, overlapY: Math.max(maxY - minY, 0) / rect1.height };
}

export function computeMidpoint(rect: Rect) {
    return { x: rect.width / 2 + rect.x, y: rect.height / 2 + rect.y };
}

export function removePaddingFromRect(element: HTMLElement, rect: Rect) {
    const top = pixelStringToNumber(element.style.paddingTop);
    const left = pixelStringToNumber(element.style.paddingLeft);
    const right = pixelStringToNumber(element.style.paddingRight);
    const bottom = pixelStringToNumber(element.style.paddingBottom);
    return { x: rect.x + left, y: rect.y + top, width: rect.width - (left + right), height: rect.height - (top + bottom) };
}

export function pixelStringToNumber(pixelString: string) {
    return (pixelString && pixelString.length > 0) ? Number.parseFloat(pixelString.substring(0, pixelString.length - 2)) : 0;
}

export function removePaddingFromHoverResult(result: HoverResult) {
    result.element.style.paddingTop = '';
    result.element.style.paddingBottom = '';
    result.element.style.paddingLeft = '';
    result.element.style.paddingRight = '';
}

export function updateContainingStyleSize(containingElement: HTMLDivElement, direction: 'horizontal' | 'vertical', amount: number) {
    if (direction === 'horizontal') {
        containingElement.style.width = `${amount}px`;
    } else {
        containingElement.style.height = `${amount}px`;
    }
}

export function calculatePlacement(rectA: Rect, rectB: Rect, direction: 'horizontal' | 'vertical'): 'before' | 'after' {
    const key = direction === 'horizontal' ? 'x' : 'y';
    return computeMidpoint(rectA)[key] >
        computeMidpoint(rectB)[key]
        ? 'before'
        : 'after';
}

export function growOrShrinkRectInList(rects: Array<Rect>, startIndex: number, offset: Position) {
    const newRects = [...rects];
    const toResize = newRects[startIndex];
    if (!toResize || !offset) { console.log(toResize, rects, startIndex, offset); }
    newRects[startIndex] = { x: toResize.x, y: toResize.y, width: toResize.width + offset.x, height: toResize.height + offset.y };
    for (let i: number = startIndex + 1; i < newRects.length; i++) {
        newRects[i] = translateRectBy(newRects[i], offset);
    }
    return newRects;
}

export function translateRectsBy(rects: Array<Rect>, startIndex: number, offset: Position) {
    const newRects = [...rects];
    for (let i: number = startIndex; i < newRects.length; i++) {
        newRects[i] = translateRectBy(newRects[i], offset);
    }
    return newRects;
}

function translateRectBy(rect: Rect, offset: Position) {
    return moveRectTo(rect, { x: rect.x + offset.x, y: rect.y + offset.y });
}

export function moveRectTo({ width, height }: Rect, { x, y }: Position) {
    return { x, y, width, height };
}
