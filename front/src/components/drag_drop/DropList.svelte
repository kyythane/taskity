<style>
    .dropContainer {
        height: 100%;
        width: 100%;
        overscroll-behavior: contain;
    }

    .dragContainer {
        flex-shrink: 0;
        flex-grow: 0;
    }

    .horizontal {
        display: flex;
        overflow-x: scroll;
    }

    .vertical {
        overflow-y: scroll;
    }
</style>

<script lang="ts">
    import { onMount, tick, onDestroy, createEventDispatcher } from 'svelte';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    import {
        computeMidpoint,
        makeDraggableElement,
        calculatePlacement,
        overlap,
        percentOverlap,
        removePaddingFromRect,
        removePaddingFromHoverResult,
        updateContainingStyleSize,
        moveRectTo,
        pixelStringToNumber,
        translateRectsBy,
    } from './utilities';
    import { dragging, dropTargets, dragTarget, dropTargetId } from './stores';

    import type { Writable } from 'svelte/store';
    import type {
        Id,
        Item,
        Position,
        Rect,
        DropTarget,
        DropCallback,
        HoverCallback,
        HoverResult,
    } from './stores';

    const DRAG_THRESHOLD = 25;
    const ANIMATION_MS = 200;
    const SCROLL_ON_DRAG_THRESHOLD_PERCENT = 0.1;
    const SCROLL_ON_DRAG_THRESHOLD_MIN_PIXELS = 50;
    const SCROLL_ON_DRAG_THRESHOLD_MAX_PIXELS = 150;

    export let items: Array<Item>;
    export let key: string | undefined = undefined;
    export let capacity = Number.POSITIVE_INFINITY;
    export let disabled: boolean = false;
    export let disableScrollOnDrag: boolean = false;
    export let disableDropSpacing: boolean = false;
    export let enableResizeListeners: boolean = false;
    export let direction: 'horizontal' | 'vertical' = 'horizontal';
    export const id = dropTargetId.next();

    let cachedItems: Array<Item> = [];
    let cachedRects: Array<Rect | undefined> = [];
    let cachedDropZoneRect: Rect;
    let cachedCapacity = capacity;
    let cachedDisabled = disabled;
    let cachedDisplay: string | undefined;
    let wrappingElements: { [id: string]: HTMLDivElement } = {};
    let dropZone: HTMLDivElement;
    let currentWidth: number = 0;
    let currentHeight: number = 0;
    let mounted = false;
    let potentiallDraggedId: Id | undefined = undefined;
    let currentlyDraggingOver: HoverResult = undefined;
    let previouslyDraggedOver: HoverResult[] = [];
    let draggableDragStart: Position | undefined = undefined;
    let handleDelayedEvent: (() => void) | undefined;
    // Tweened isn't exported, so use Writable since it is _mostly_ correct
    let dragTween: Writable<Position> | undefined = undefined;
    let sourceElementTween: Writable<number> | undefined = undefined;
    let hoverEnterElementTween: Writable<number> | undefined = undefined;
    let hoverLeaveElementTweens: Writable<number[]> | undefined = undefined;
    let dragScrollTween: Writable<number> | undefined = undefined;
    let dragScrollTarget: number;
    let currentDropTarget:
        | { dropTarget: DropTarget; hoverResult: HoverResult | undefined }
        | undefined = undefined;
    let scrollKey: 'scrollTop' | 'scrollLeft' = 'scrollTop';
    let dimensionKey: 'height' | 'width' = 'height';
    let paddingKeys:
        | { before: 'paddingTop'; after: 'paddingBottom' }
        | { before: 'paddingLeft'; after: 'paddingRight' } = {
        before: 'paddingTop',
        after: 'paddingBottom',
    };
    let cachedDirection: 'horizontal' | 'vertical' = 'horizontal';
    const dispatch = createEventDispatcher();

    const moveDraggable = (event: MouseEvent) => {
        if (
            $dragTarget?.controllingDropZoneId === id &&
            ($dragging === 'picking-up' || $dragging === 'dragging')
        ) {
            event.preventDefault();
            $dragTween = {
                x: event.clientX - draggableDragStart.x,
                y: event.clientY - draggableDragStart.y,
            };
        }
    };

    const cleanupAfterDrag = () => {
        $dragging = 'none';
        document.body.removeChild($dragTarget.dragElement);
        let containingElement =
            wrappingElements[($dragTarget.item.id as unknown) as string];
        containingElement.style[dimensionKey] = '';
        (containingElement
            .children[0] as HTMLElement).style.display = cachedDisplay;
        cachedRects = [];
        draggableDragStart = undefined;
        cachedDisplay = undefined;
        $dragTarget = undefined;
        currentDropTarget = undefined;
        dragScrollTween = undefined;
    };

    const endDrag = async (event: MouseEvent) => {
        if (
            $dragTarget?.controllingDropZoneId === id &&
            ($dragging === 'picking-up' || $dragging === 'dragging')
        ) {
            event.preventDefault();
            if (!!currentDropTarget) {
                // Ensure we have the latest hoverResult, but don't update it to `undefined` if it was defined.
                let hoverResult =
                    currentDropTarget.dropTarget.hoverCallback() ||
                    currentDropTarget.hoverResult;
                $dragging = 'dropping';
                let offset: { x: number; y: number };
                // go go gadget structural typing
                if (!!hoverResult) {
                    const boundingRect = hoverResult.element.getBoundingClientRect();
                    if (hoverResult.placement === 'before') {
                        offset = boundingRect;
                    } else {
                        const strippedRect = removePaddingFromRect(
                            hoverResult.element,
                            boundingRect
                        );
                        if (direction === 'horizontal') {
                            offset = {
                                x: boundingRect.x + strippedRect.width,
                                y: boundingRect.y,
                            };
                        } else {
                            offset = {
                                x: boundingRect.x,
                                y: boundingRect.y + strippedRect.height,
                            };
                        }
                    }
                } else {
                    offset = currentDropTarget.dropTarget.rect;
                }
                const position = {
                    x: offset.x - $dragTarget.sourceRect.x,
                    y: offset.y - $dragTarget.sourceRect.y,
                };
                // Tweened .set returns a promise that resolves, but our types don't show that
                await dragTween.set(position);
                currentDropTarget.dropTarget.dropCallback(hoverResult);
                // We only send drop events when reordering a list, since the element never really left
                if (currentDropTarget.dropTarget.id !== id) {
                    dispatch('itemdraggedout', {
                        item: $dragTarget.item,
                        listSnapshot: [
                            ...cachedItems.filter(
                                (cachedItem) =>
                                    cachedItem.id !== $dragTarget.item.id
                            ),
                        ],
                        destinationDropZone: currentDropTarget.dropTarget.id,
                    });
                }
                cleanupAfterDrag();
            } else {
                $dragging = 'returning';
                sourceElementTween.set($dragTarget.sourceRect[dimensionKey]);
                if (!!currentlyDraggingOver) {
                    startDragOff();
                }
                // Tweened .set returns a promise that resolves, but our types don't show that
                await dragTween.set({ x: 0, y: 0 });
                dispatch('dragcancelled', {
                    item: $dragTarget.item,
                });
                cleanupAfterDrag();
            }
        }
    };

    const handleDraggableMouseDown = (
        event: MouseEvent,
        id: Id,
        delayedEvent?: (event: MouseEvent) => void
    ) => {
        if (
            !cachedDisabled &&
            !!cachedItems.find((c) => c.id === id) &&
            event.button === 0
        ) {
            draggableDragStart = { x: event.clientX, y: event.clientY };
            potentiallDraggedId = id;
            if (!!delayedEvent) {
                handleDelayedEvent = () => {
                    delayedEvent(event);
                };
            }
        } else if (!!delayedEvent) {
            delayedEvent(event);
        }
    };

    const handleDraggableMouseUp = () => {
        if ($dragging === 'none') {
            if (handleDelayedEvent) {
                handleDelayedEvent();
            }
            draggableDragStart = undefined;
            potentiallDraggedId = undefined;
            handleDelayedEvent = undefined;
        }
    };

    const handleDraggableMouseMove = async (event: MouseEvent) => {
        if (!!draggableDragStart && $dragging === 'none') {
            let dx = draggableDragStart.x - event.clientX;
            let dy = draggableDragStart.y - event.clientY;
            if (dx * dx + dy * dy > DRAG_THRESHOLD) {
                $dragging = 'picking-up';
                const containingElement =
                    wrappingElements[
                        (potentiallDraggedId as unknown) as string
                    ];
                const cloned = makeDraggableElement(containingElement);
                document.body.append(cloned);
                $dragTarget = {
                    item: cachedItems.find(
                        (c) => c.id === potentiallDraggedId
                    )!,
                    controllingDropZoneId: id,
                    dragElement: cloned,
                    sourceRect: containingElement.getBoundingClientRect(),
                    cachedRect: cloned.getBoundingClientRect(),
                };
                dragTween = tweened(
                    { x: 0, y: 0 },
                    {
                        duration: ANIMATION_MS,
                        easing: cubicOut,
                    }
                );
                potentiallDraggedId = undefined;
                handleDelayedEvent = undefined;
                currentlyDraggingOver = undefined;
                currentDropTarget = undefined;
                previouslyDraggedOver = [];
                sourceElementTween = tweened(
                    $dragTarget.sourceRect[dimensionKey],
                    {
                        duration: ANIMATION_MS,
                        easing: cubicOut,
                    }
                );
                updateContainingStyleSize(
                    containingElement,
                    cachedDirection,
                    $dragTarget.sourceRect[dimensionKey]
                );
                const child = containingElement.children[0] as HTMLElement;
                cachedDisplay = child.style.display;
                child.style.display = 'none';
                await sourceElementTween.set(0);
                $dragging = 'dragging';
                const index = Math.max(
                    0,
                    cachedItems.findIndex(
                        (item) => item.id === $dragTarget.item.id
                    )
                );
                const offset =
                    cachedDirection === 'horizontal'
                        ? { x: -$dragTarget.sourceRect.width, y: 0 }
                        : { x: 0, y: -$dragTarget.sourceRect.height };
                cachedRects = translateRectsBy(cachedRects, index, offset);
            }
        }
    };

    const dropCallback: DropCallback = (drop: HoverResult | undefined) => {
        let dropIndex: number;
        if (!!drop) {
            if (drop.placement === 'before') {
                dropIndex = drop.index;
            } else {
                dropIndex = drop.index + 1;
            }
        } else {
            dropIndex = 0;
        }
        // Always filter because it isn't that expensive and it avoids special casing dropping back in the same list (as much as possible)
        const firstSection = cachedItems
            .slice(0, dropIndex)
            .filter((cachedItem) => cachedItem.id !== $dragTarget.item.id);
        const secondSection = cachedItems
            .slice(dropIndex)
            .filter((cachedItem) => cachedItem.id !== $dragTarget.item.id);
        const listSnapshot = [
            ...firstSection,
            $dragTarget.item,
            ...secondSection,
        ];
        const finalIndex = listSnapshot.findIndex(
            (snapshotItem) => snapshotItem.id === $dragTarget.item.id
        );
        if (!!currentlyDraggingOver) {
            removePaddingFromHoverResult(currentlyDraggingOver);
            currentlyDraggingOver = undefined;
            hoverEnterElementTween = undefined;
        }
        dispatch('itemdroppedin', {
            item: $dragTarget.item,
            index: finalIndex,
            insertedAfter:
                finalIndex > 0 ? cachedItems[finalIndex - 1] : undefined,
            listSnapshot,
            sourceDropZone: $dragTarget.controllingDropZoneId,
        });
    };

    const startDragOver = (hoverResult: HoverResult) => {
        if (disableDropSpacing) {
            return;
        }
        const draggedOffIndex = previouslyDraggedOver.findIndex(
            (previous) =>
                previous.item.id === hoverResult.item.id &&
                previous.placement === hoverResult.placement
        );
        let startingSize = 0;
        if (draggedOffIndex > -1) {
            previouslyDraggedOver = previouslyDraggedOver.filter(
                (_, index) => index !== draggedOffIndex
            );
            const sizes = $hoverLeaveElementTweens;
            startingSize = Math.min(
                sizes[draggedOffIndex],
                $dragTarget.cachedRect[dimensionKey]
            );
            const filteredSizes = sizes.filter(
                (_, index) => index !== draggedOffIndex
            );
            hoverLeaveElementTweens = tweened(filteredSizes, {
                duration: ANIMATION_MS,
                easing: cubicOut,
            });
            hoverLeaveElementTweens.set(
                new Array(filteredSizes.length).fill(0)
            );
        }

        currentlyDraggingOver = hoverResult;
        hoverEnterElementTween = tweened(startingSize, {
            duration: ANIMATION_MS,
            easing: cubicOut,
        });
        hoverEnterElementTween.set($dragTarget.cachedRect[dimensionKey]);
    };

    const startDragOff = () => {
        if (!currentlyDraggingOver) {
            return;
        }
        const indexOfCurrent = previouslyDraggedOver.findIndex(
            (prev) =>
                prev.item.id === currentlyDraggingOver.item.id &&
                prev.placement === currentlyDraggingOver.placement
        );
        let previousTweenValues = !!hoverLeaveElementTweens
            ? $hoverLeaveElementTweens
            : [];
        if (indexOfCurrent >= 0) {
            previouslyDraggedOver = previouslyDraggedOver.filter(
                (_, index) => index !== indexOfCurrent
            );
            previousTweenValues = previousTweenValues.filter(
                (_, index) => index !== indexOfCurrent
            );
        }
        previouslyDraggedOver = [
            ...previouslyDraggedOver,
            currentlyDraggingOver,
        ];
        hoverLeaveElementTweens = tweened(
            [
                ...previousTweenValues,
                Math.min(
                    $hoverEnterElementTween,
                    $dragTarget.cachedRect[dimensionKey]
                ),
            ],
            {
                duration: ANIMATION_MS,
                easing: cubicOut,
            }
        );
        hoverLeaveElementTweens.set(
            new Array(previousTweenValues.length + 1).fill(0)
        );
        hoverEnterElementTween = undefined;
        currentlyDraggingOver = undefined;
    };

    const checkScroll = () => {
        if (disableScrollOnDrag) {
            dragScrollTween = undefined;
            dragScrollTarget = dropZone[scrollKey];
            return;
        }
        const midpoint =
            cachedDirection === 'horizontal'
                ? computeMidpoint($dragTarget.cachedRect).x
                : computeMidpoint($dragTarget.cachedRect).y;
        const compOffset =
            cachedDirection === 'horizontal'
                ? cachedDropZoneRect.x
                : cachedDropZoneRect.y;
        let threshold = Math.min(
            Math.max(
                SCROLL_ON_DRAG_THRESHOLD_PERCENT *
                    cachedDropZoneRect[dimensionKey],
                SCROLL_ON_DRAG_THRESHOLD_MIN_PIXELS
            ),
            SCROLL_ON_DRAG_THRESHOLD_MAX_PIXELS
        );
        if (midpoint <= threshold + compOffset) {
            if (dragScrollTarget >= dropZone[scrollKey]) {
                dragScrollTween = tweened(dropZone[scrollKey], {
                    duration: ANIMATION_MS,
                });
                dragScrollTarget = dropZone[scrollKey] - 100;
                dragScrollTween.set(dragScrollTarget);
            }
        } else if (
            midpoint >=
            cachedDropZoneRect[dimensionKey] - threshold + compOffset
        ) {
            if (dragScrollTarget <= dropZone[scrollKey]) {
                dragScrollTween = tweened(dropZone[scrollKey], {
                    duration: ANIMATION_MS,
                });
                dragScrollTarget = dropZone[scrollKey] + 100;
                dragScrollTween.set(dragScrollTarget);
            }
        } else {
            dragScrollTween = undefined;
            dragScrollTarget = dropZone[scrollKey];
        }
    };

    const hoverCallback: HoverCallback = () => {
        if (cachedItems.length === 0) {
            return undefined;
        }
        checkScroll();
        let overlapped = false;
        const overlapping = [];
        for (let index = 0; index < cachedItems.length; index++) {
            const cachedItem = cachedItems[index];
            const element =
                wrappingElements[(cachedItem.id as unknown) as string];
            if (
                index >= cachedRects.length ||
                cachedRects[index] === undefined
            ) {
                cachedRects[index] = element.getBoundingClientRect();
            }
            let overlaps = overlap($dragTarget.cachedRect, cachedRects[index]!);
            let rectWithoutPadding = removePaddingFromRect(
                element,
                cachedRects[index]!
            );
            let placement = calculatePlacement(
                rectWithoutPadding,
                $dragTarget.cachedRect,
                cachedDirection
            );
            if (overlaps) {
                overlapping.push({
                    index,
                    item: cachedItem,
                    element,
                    placement,
                });
                overlapped = true;
            } else if (overlapped) {
                break;
            }
        }
        // Since cachedItems must be non-empty. If nothing overlaps, we are past the end of the list.
        if (overlapping.length === 0) {
            const lastIndex = cachedItems.length - 1;
            const lastItem = cachedItems[lastIndex];
            overlapping.push({
                index: lastIndex,
                item: lastItem,
                element: wrappingElements[(lastItem.id as unknown) as string],
                placement: 'after',
            });
        }
        const midpoint = Math.trunc(
            (overlapping[0].index + overlapping[overlapping.length - 1].index) /
                2
        );
        let overlappedItem = overlapping.find((o) => o.index === midpoint);
        /* Only use 'before' placement at the start of the list. Since we are changing padding,
         we want to reduce the chance of weird interactions with wrapping.
         */
        if (overlappedItem.placement === 'before' && overlappedItem.index > 0) {
            const indexBefore = overlappedItem.index - 1;
            const itemBefore = cachedItems[indexBefore];
            overlappedItem = {
                index: indexBefore,
                item: itemBefore,
                element: wrappingElements[(itemBefore.id as unknown) as string],
                placement: 'after',
            };
        }
        if (!currentlyDraggingOver) {
            startDragOver(overlappedItem);
        } else if (
            currentlyDraggingOver.item.id !== overlappedItem.item.id ||
            currentlyDraggingOver.placement !== overlappedItem.placement
        ) {
            startDragOff();
            startDragOver(overlappedItem);
        }
        return overlappedItem;
    };

    const enterDropZone = () => {
        dispatch('dropzoneenter', {
            item: $dragTarget.item,
            rect: $dragTarget.cachedRect,
        });
    };

    const leaveDropZone = () => {
        if (!!currentlyDraggingOver) {
            startDragOff();
        }
        dragScrollTween = undefined;
        dispatch('dropzoneleave', {
            item: $dragTarget.item,
            rect: $dragTarget.cachedRect,
        });
    };

    // Update the dropTarget for this dropZone
    $: {
        if (mounted) {
            let updatedRect = false;
            let updatedCapacity = false;
            let updatedDisabled = false;
            if (
                enableResizeListeners &&
                (cachedDropZoneRect.width !== currentWidth ||
                    cachedDropZoneRect.height !== currentHeight)
            ) {
                let bounding = dropZone.getBoundingClientRect();
                cachedDropZoneRect = {
                    x: bounding.left,
                    y: bounding.top,
                    width: currentWidth,
                    height: currentHeight,
                };
                updatedRect = true;
            }

            if (capacity - cachedItems.length !== cachedCapacity) {
                cachedCapacity = Math.max(0, capacity - cachedItems.length);
                updatedCapacity = true;
            }

            if (disabled !== cachedDisabled) {
                cachedDisabled = disabled;
                updatedDisabled = true;
            }

            if (updatedRect || updatedCapacity || updatedDisabled) {
                $dropTargets = [
                    ...$dropTargets.filter((dt) => dt.id !== id),
                    {
                        id,
                        key,
                        capacity: cachedCapacity,
                        rect: cachedDropZoneRect,
                        disabled: cachedDisabled,
                        dropElement: dropZone,
                        dropCallback,
                        hoverCallback,
                        enterDropZone,
                        leaveDropZone,
                        hasItem,
                        getEventHandlers,
                    },
                ];
            }
        }
    }

    // Update list of items
    $: {
        if ($dragging === 'none') {
            cachedItems = [...items];
            cachedDirection = direction;
            scrollKey =
                cachedDirection === 'horizontal' ? 'scrollLeft' : 'scrollTop';
            dimensionKey =
                cachedDirection === 'horizontal' ? 'width' : 'height';
            paddingKeys =
                cachedDirection === 'horizontal'
                    ? { before: 'paddingLeft', after: 'paddingRight' }
                    : { before: 'paddingTop', after: 'paddingBottom' };
        }
    }

    // Hide element that was dragged
    $: {
        if (
            $dragTarget?.controllingDropZoneId === id &&
            ($dragging === 'picking-up' || $dragging === 'returning')
        ) {
            updateContainingStyleSize(
                wrappingElements[$dragTarget.item.id],
                cachedDirection,
                $sourceElementTween
            );
        }
    }

    // Drop preview transition in
    $: {
        if (!!currentlyDraggingOver && !!hoverEnterElementTween) {
            const offset = $hoverEnterElementTween;
            const lastOffset = pixelStringToNumber(
                currentlyDraggingOver.element.style[
                    paddingKeys[currentlyDraggingOver.placement]
                ]
            );
            currentlyDraggingOver.element.style[
                paddingKeys[currentlyDraggingOver.placement]
            ] = `${offset}px`;
            const delta = offset - lastOffset;
            const offsetPosition =
                cachedDirection === 'horizontal'
                    ? { x: delta, y: 0 }
                    : { x: 0, y: delta };
            cachedRects = translateRectsBy(
                cachedRects,
                currentlyDraggingOver.index,
                offsetPosition
            );
        }
    }

    // Drop preview transition out
    $: {
        if (previouslyDraggedOver.length > 0 && !!hoverLeaveElementTweens) {
            const sizes = $hoverLeaveElementTweens;
            const deltas: Array<{ index: number; delta: number }> = [];
            previouslyDraggedOver = previouslyDraggedOver.map(
                (target, index) => {
                    const lastSize = pixelStringToNumber(
                        target.element.style[paddingKeys[target.placement]]
                    );
                    const delta = sizes[index] - lastSize;
                    deltas.push({ index: target.index, delta });
                    target.element.style[
                        paddingKeys[target.placement]
                    ] = `${sizes[index]}px`;
                    return target;
                }
            );
            let zeros = 0;
            for (let i = 0; i < sizes.length; i++) {
                if (sizes[i] > 0) {
                    break;
                }
                ++zeros;
            }
            if (zeros > 0) {
                previouslyDraggedOver = previouslyDraggedOver.slice(zeros);
                hoverLeaveElementTweens = tweened(sizes.slice(zeros), {
                    duration: ANIMATION_MS,
                    easing: cubicOut,
                });
                hoverLeaveElementTweens.set(
                    new Array(previouslyDraggedOver.length).fill(0)
                );
            }
            deltas.forEach(({ index, delta }) => {
                const offsetPosition =
                    cachedDirection === 'horizontal'
                        ? { x: delta, y: 0 }
                        : { x: 0, y: delta };
                cachedRects = translateRectsBy(
                    cachedRects,
                    index,
                    offsetPosition
                );
            });
        }
    }

    const hasItem = (itemId: Id) => {
        return !!cachedItems.find((c) => c.id === itemId);
    };

    const getEventHandlers = () => {
        return {
            handleMouseDown: handleDraggableMouseDown,
            handleMouseUp: handleDraggableMouseUp,
            handleMouseMove: handleDraggableMouseMove,
        };
    };

    const postScrollUpdate = async (previous: number) => {
        await tick();
        const delta = dropZone[scrollKey] - previous;
        const offsetPosition =
            cachedDirection === 'horizontal'
                ? { x: -delta, y: 0 }
                : { x: 0, y: -delta };
        cachedRects = translateRectsBy(cachedRects, 0, offsetPosition);
        if (dropZone[scrollKey] === dragScrollTarget) {
            checkScroll();
        }
        // TODO: I think this is part of the padding bug, but we need to run the
        hoverCallback();
    };

    // Update scroll
    $: {
        if ($dragging === 'dragging' && !!dragScrollTween) {
            const previous = dropZone[scrollKey];
            dropZone[scrollKey] = $dragScrollTween;
            postScrollUpdate(previous);
        }
    }

    // Move dragTarget
    $: {
        if ($dragTarget?.controllingDropZoneId === id) {
            // I like guards
            if ($dragging !== 'none') {
                dragTarget.update((target) => {
                    const dragOffset = $dragTween;
                    target.dragElement.style.transform = `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`;
                    target.cachedRect = moveRectTo(target.cachedRect, {
                        x: dragOffset.x + draggableDragStart.x,
                        y: dragOffset.y + draggableDragStart.y,
                    });
                    return target;
                });
            }
            if ($dragging === 'dragging') {
                let validTargets = $dropTargets.filter(
                    (target) =>
                        !target.disabled &&
                        $dragTarget.key === target.key &&
                        target.capacity > 0
                );

                let overlapping:
                    | {
                          target: DropTarget;
                          overlap: { overlapX: number; overlapY: number };
                      }
                    | undefined;
                /* Can't call reduce (without an initial value) on an empty array, so check that we have something 
                in it before doing the overlap check */
                if (validTargets.length === 0) {
                    overlapping = undefined;
                } else {
                    overlapping = validTargets
                        .map((target) => {
                            return {
                                target,
                                overlap: percentOverlap(
                                    $dragTarget.cachedRect,
                                    target.rect
                                ),
                            };
                        })
                        .reduce((acc, next) => {
                            if (
                                next.overlap.overlapX > acc.overlap.overlapX ||
                                next.overlap.overlapY > acc.overlap.overlapY
                            ) {
                                return next;
                            }
                            return acc;
                        });
                }

                if (
                    overlapping &&
                    overlapping.overlap.overlapX > 0 &&
                    overlapping.overlap.overlapY > 0
                ) {
                    if (
                        !!currentDropTarget &&
                        currentDropTarget.dropTarget.id !==
                            overlapping.target.id
                    ) {
                        currentDropTarget.dropTarget.leaveDropZone();
                        currentDropTarget = undefined;
                    }
                    if (!currentDropTarget) {
                        overlapping.target.enterDropZone();
                    }
                    const hoverResult = overlapping.target.hoverCallback();
                    currentDropTarget = {
                        dropTarget: overlapping.target,
                        hoverResult,
                    };
                } else if (!!currentDropTarget) {
                    currentDropTarget.dropTarget.leaveDropZone();
                    currentDropTarget = undefined;
                }
            }
        }
    }

    onMount(() => {
        const bounding = dropZone.getBoundingClientRect();
        cachedDisabled = disabled;
        cachedCapacity = capacity - items.length;
        if (enableResizeListeners) {
            cachedDropZoneRect = {
                x: bounding.left,
                y: bounding.top,
                width: currentWidth,
                height: currentHeight,
            };
        } else {
            cachedDropZoneRect = bounding;
        }

        $dropTargets = [
            ...$dropTargets,
            {
                id,
                key,
                capacity: cachedCapacity,
                rect: cachedDropZoneRect,
                disabled: cachedDisabled,
                dropElement: dropZone,
                dropCallback,
                hoverCallback,
                enterDropZone,
                leaveDropZone,
                hasItem,
                getEventHandlers,
            },
        ];
        mounted = true;
    });

    onDestroy(() => {
        $dropTargets = $dropTargets.filter((dt) => dt.id !== id);
    });
</script>

<svelte:window
    on:mousemove="{moveDraggable}"
    on:mouseup="{endDrag}"
    on:mouseleave="{endDrag}"
/>
<!--
<div>
    <slot name="standin" data={}></slot>
</div>
-->

{#if enableResizeListeners}
    <div
        bind:this="{dropZone}"
        bind:clientWidth="{currentWidth}"
        bind:clientHeight="{currentHeight}"
        class="{`dropContainer ${cachedDirection === 'horizontal' ? 'horizontal' : 'vertical'}`}"
    >
        {#each cachedItems as item (item.id)}
            <div bind:this="{wrappingElements[item.id]}" class="dragContainer">
                <slot
                    name="listItem"
                    data="{{ item, isDraggingOver: currentlyDraggingOver?.item.id === item.id, dragEventHandlers: { handleMouseDown: handleDraggableMouseDown, handleMouseUp: handleDraggableMouseUp, handleMouseMove: handleDraggableMouseMove } }}"
                />
            </div>
        {/each}
    </div>
{:else}
    <div
        bind:this="{dropZone}"
        class="{`dropContainer ${cachedDirection === 'horizontal' ? 'horizontal' : 'vertical'}`}"
    >
        {#each cachedItems as item (item.id)}
            <div bind:this="{wrappingElements[item.id]}" class="dragContainer">
                <slot
                    name="listItem"
                    data="{{ item, isDraggingOver: currentlyDraggingOver?.item.id === item.id, dragEventHandlers: { handleMouseDown: handleDraggableMouseDown, handleMouseUp: handleDraggableMouseUp, handleMouseMove: handleDraggableMouseMove } }}"
                />
            </div>
        {/each}
    </div>
{/if}
