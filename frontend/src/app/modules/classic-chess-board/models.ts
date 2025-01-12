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