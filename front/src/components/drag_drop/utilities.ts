import type { Rect } from "./stores";

export function makeDraggableElement(originalElement: HTMLDivElement) {
    const rect = originalElement.getBoundingClientRect();
    const draggedEl = originalElement.cloneNode(true) as HTMLDivElement;
    draggedEl.id = `drag-placeholder`;
    draggedEl.style.position = "fixed";
    draggedEl.style.top = `${rect.top}px`;
    draggedEl.style.left = `${rect.left}px`;
    draggedEl.style.zIndex = '9999';
    draggedEl.style.cursor = 'grabbing';
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

export function stripPadding(element: HTMLElement, rect: Rect) {
    const top = pixelStringToNumber(element.style.paddingTop);
    const left = pixelStringToNumber(element.style.paddingLeft);
    const right = pixelStringToNumber(element.style.paddingRight);
    const bottom = pixelStringToNumber(element.style.paddingBottom);
    return { x: rect.x + left, y: rect.y + top, width: rect.width - (left + right), height: rect.height - (top + bottom) };
}

export function pixelStringToNumber(pixelString: string) {
    return (pixelString && pixelString.length > 0) ? Number.parseFloat(pixelString.substring(0, pixelString.length - 2)) : 0;
}