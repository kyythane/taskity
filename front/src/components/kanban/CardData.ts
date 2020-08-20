import type { ColorName } from '../utility/Colors';

export type CardData = {
    id: string,
    title: string,
    labels: CardLabel[],
};

export type CardLabel = {
    id: string,
    text: string,
    color: ColorName,
};