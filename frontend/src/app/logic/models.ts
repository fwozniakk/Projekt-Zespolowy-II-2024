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

type KingInCheck = {
    isInCheck: true;
    x: number;
    y: number;
}

type KingNotInCheck = {
    isInCheck: false;
}

export type CheckState = KingInCheck | KingNotInCheck;

export type LastMove = {
    unit: Unit,
    prevX: number,
    prevY: number,
    currX: number,
    currY: number,
}

export const imagePaths: Readonly<Record<FENChar, string>> = {
    [FENChar.WhitePawn]: "",
    [FENChar.WhiteKnight]: "LightKnight.webp",
    [FENChar.WhiteBishop]: "LightBishop.webp",
    [FENChar.WhiteRook]: "LightRook.webp",
    [FENChar.WhiteQueen]: "LightQueen.webp",
    [FENChar.WhiteKing]: "",
    [FENChar.BlackPawn]: "",
    [FENChar.BlackKnight]: "DarkKnight.webp",
    [FENChar.BlackBishop]: "DarkBishop.webp",
    [FENChar.BlackRook]: "DarkRook.webp",
    [FENChar.BlackQueen]: "DarkQueen.webp",
    [FENChar.BlackKing]: ""
}