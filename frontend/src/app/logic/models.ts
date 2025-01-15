import { Unit } from "./unit/unit";

export type Move = {
    x: number;
    y: number;
}

export enum Side {
    White = "white",
    Black = "black",
}

export enum FENChar {
    WhitePawn = "P",
    WhiteKnight = "N",
    WhiteBishop = "B",
    WhiteRook = "R",
    WhiteQueen = "Q",
    WhiteKing = "K",
    BlackPawn = "p",
    BlackKnight = "n",
    BlackBishop = "b",
    BlackRook = "r",
    BlackQueen = "q",
    BlackKing = "k",
}

export type AvailablePositions = Map<string, Move[]>;

type KingChecked = {
    isInCheck: true;
    x: number;
    y: number;
}

type KingNotChecked = {
    isInCheck: false;
}

export type CheckState = KingChecked | KingNotChecked;

export type LastMove = {
    unit: Unit,
    prevX: number,
    prevY: number,
    currX: number,
    currY: number,
}