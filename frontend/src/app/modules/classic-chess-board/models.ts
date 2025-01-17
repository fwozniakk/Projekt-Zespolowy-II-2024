import { FENChar } from "../../logic/models"

type PositionWithUnit = {
    unit: FENChar;
    x: number;
    y: number;
}

type EmptyPosition = {
    unit: null;
}

export type SelectedPosition = PositionWithUnit | EmptyPosition;

export const columns = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;