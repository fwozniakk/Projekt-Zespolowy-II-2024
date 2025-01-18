import { FENChar } from "../../logic/models";

export type StockfishQuery = {
    fen: string,
    depth: number,
    mode?: string,
}

export type Move = {
    prevX: number,
    prevY: number,
    newX: number,
    newY: number,
    promotedUnit: FENChar | null,
}

export type StockfishResponse = {
    bestmove: string,
    success: boolean,
    evaulatuion: number | null,
    mate: number | null,
    continuation: string,
}