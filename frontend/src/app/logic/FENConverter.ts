import { columns } from "../modules/classic-chess-board/models";
import { Side, LastMove } from "./models";
import { King } from "./unit/king";
import { Pawn } from "./unit/pawn";
import { Unit } from "./unit/unit";
import { Rook } from "./unit/rook";

export class FENConverter {
    public static readonly initalPosition: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    public convertBoardToFEN(
        board: (Unit | null)[][],
        playerSide: Side,
        lastMove: LastMove | undefined,
        fiftyMoveRuleCounter: number,
        numberOfFullMoves: number
    ): string {
        let FEN: string = "";

        for (let i = 7; i >= 0; i--) {
            let FENRow: string = "";
            let consecutiveEmptySquaresCounter = 0;

            for (const unit of board[i]) {
                if (!unit) {
                    consecutiveEmptySquaresCounter++;
                    continue;
                }

                if (consecutiveEmptySquaresCounter !== 0)
                    FENRow += String(consecutiveEmptySquaresCounter);

                consecutiveEmptySquaresCounter = 0;
                FENRow += unit.fenChar;
            }

            if (consecutiveEmptySquaresCounter !== 0)
                FENRow += String(consecutiveEmptySquaresCounter);

            FEN += (i === 0) ? FENRow : FENRow + "/";
        }

        const player: string = playerSide === Side.White ? "w" : "b";
        FEN += " " + player;
        FEN += " " + this.castlingAvailability(board);
        FEN += " " + this.enPassantPosibility(lastMove, playerSide);
        FEN += " " + fiftyMoveRuleCounter * 2;
        FEN += " " + numberOfFullMoves;
        return FEN;
    }

    private castlingAvailability(board: (Unit | null)[][]): string {
        const castlingPossibilities = (side: Side): string => {
            let castlingAvailability: string = "";

            const kingX: number = side === Side.White ? 0 : 7;
            const king: Unit | null = board[kingX][4];

            if (king instanceof King && !king.moved) {
                const rookX: number = kingX;
                const kingSideRook = board[rookX][7];
                const queenSideRook = board[rookX][0];

                if (kingSideRook instanceof Rook && !kingSideRook.moved)
                    castlingAvailability += "k";

                if (queenSideRook instanceof Rook && !queenSideRook.moved)
                    castlingAvailability += "q";

                if (side === Side.White)
                    castlingAvailability = castlingAvailability.toUpperCase();
            }
            return castlingAvailability;
        }

        const castlingAvailability: string = castlingPossibilities(Side.White) + castlingPossibilities(Side.Black);
        return castlingAvailability !== "" ? castlingAvailability : "-";
    }

    private enPassantPosibility(lastMove: LastMove | undefined, side: Side): string {
        if (!lastMove) return "-";
        const { unit, currX: newX, prevX, prevY } = lastMove;

        if (unit instanceof Pawn && Math.abs(newX - prevX) === 2) {
            const row: number = side === Side.White ? 6 : 3;
            return columns[prevY] + String(row);
        }
        return "-";
    }
}