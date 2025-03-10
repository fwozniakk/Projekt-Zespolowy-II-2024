import { FENConverter } from "./FENConverter";
import { AvailablePositions, FENChar, Side, Move, CheckState, LastMove } from "./models";
import { Bishop } from "./unit/bishops";
import { King } from "./unit/king";
import { Knight } from "./unit/knight";
import { Pawn } from "./unit/pawn";
import { Queen } from "./unit/queen";
import { Rook } from "./unit/rook";
import { Unit } from "./unit/unit";

export class Board {
    private board: (Unit | null)[][];
    private _boardFEN: string = FENConverter.initalPosition;
    private _playerSide = Side.White;
    private readonly boardSize: number = 8;
    private _availablePositions: AvailablePositions;
    private _checkState: CheckState = { isInCheck: false };
    private _lastMove: LastMove | undefined;

    private _isGameOver: boolean = false;
    private _endMessage: string|undefined = "";
    private threeFoldRepHistory = new Map<string, number>();
    private threeFoldRep: boolean = false;
    private FENConverter = new FENConverter();
    private fiftyMoveRuleCounter: number = 0;
    private fullNumberOfMoves: number = 1;

    constructor() {
        this.board = this.initializeBoard();
        this._availablePositions = this.findAvailablePositions();
    }

    private initializeBoard(): (Unit | null)[][] {
        const createRow = (side: Side, pieces: (new (side: Side) => Unit)[]): (Unit | null)[] =>
            pieces.map(piece => new piece(side));

        return [
            createRow(Side.White, [Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook]),
            Array(8).fill(null).map(() => new Pawn(Side.White)),
            ...Array(4).fill(null).map(() => Array(8).fill(null)),
            Array(8).fill(null).map(() => new Pawn(Side.Black)),
            createRow(Side.Black, [Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook])
        ];
    }

    public get playerSide(): Side {
        return this._playerSide;
    }

    public get playerBoard(): (FENChar | null)[][] {
        return this.board.map(row => row.map(unit => (unit instanceof Unit ? unit.fenChar : null)));
    }

    public get checkState(): CheckState {
        return this._checkState;
    }

    public get lastMove(): LastMove | undefined {
        return this._lastMove;
    }

    public get endMessage(): string | undefined {
        return this._endMessage;
    }

    public get isGameOver(): boolean {
        return this._isGameOver;
    }

    public get availablePositions(): AvailablePositions {
        return this._availablePositions;
    }

    public get boardFEN(): string {
        return this._boardFEN;
    }

    private isMovePossible(x: number, y: number): boolean {
        return x >= 0 && y >= 0 && x < this.boardSize && y < this.boardSize;
    }

    public static isPositionDark(x: number, y: number): boolean {
        return x % 2 === 0 && y % 2 === 0 || x % 2 === 1 && y % 2 === 1;
    }

    private canCastle(king: King, kingSideCastle: boolean): boolean {
        if (king.moved) return false;

        const kingX: number = king.side === Side.White ? 0 : 7;
        const kingY: number = 4
        const rookX: number = kingX;
        const rookY: number = kingSideCastle ? 7 : 0;
        const rook: Unit | null = this.board[rookX][rookY];
        if (!(rook instanceof Rook) || rook.moved || this._checkState.isInCheck) return false;

        const firstCastlePosition: number = kingY + (kingSideCastle ? 1 : -1);
        const secondCastlePosition: number = kingY + (kingSideCastle ? 2 : -2);
        if (this.board[kingX][firstCastlePosition] || this.board[kingX][secondCastlePosition]) return false;

        if (!kingSideCastle && this.board[kingX][1]) return false;

        return this.isPositionValidAfter(kingX, kingY, kingX, firstCastlePosition) &&
            this.isPositionValidAfter(kingX, kingY, kingX, secondCastlePosition);
    }

    private isInCheckPosition(playerSide: Side, checkingCurrentPosition = false): boolean {
        for (let x = 0; x < this.boardSize; x++) {
            for (let y = 0; y < this.boardSize; y++) {
                const unit = this.board[x][y];
                if (!unit || unit.side === playerSide) continue;

                for (const { x: dx, y: dy } of unit.moves) {
                    let newX = x + dx;
                    let newY = y + dy;

                    if (!this.isMovePossible(newX, newY)) continue;

                    if (unit instanceof Pawn || unit instanceof King || unit instanceof Knight) {
                        if (unit instanceof Pawn && dy === 0) continue;
                        const threatenedUnit = this.board[newX][newY];
                        if (threatenedUnit instanceof King && threatenedUnit.side === playerSide) {
                            if (checkingCurrentPosition) this._checkState = { isInCheck: true, x: newX, y: newY };
                            return true;
                        }
                    } else {
                        while (this.isMovePossible(newX, newY)) {
                            const threatenedUnit = this.board[newX][newY];
                            if (threatenedUnit instanceof King && threatenedUnit.side === playerSide) {
                                if (checkingCurrentPosition) this._checkState = { isInCheck: true, x: newX, y: newY };
                                return true;
                            }
                            if (threatenedUnit) break;
                            newX += dx;
                            newY += dy;
                        }
                    }
                }
            }
        }
        if (checkingCurrentPosition) this._checkState = { isInCheck: false };
        return false;
    }

    private isPositionValidAfter(prevX: number, prevY: number, newX: number, newY: number): boolean {
        const unit = this.board[prevX][prevY];
        if (!unit) return false;

        const targetUnit = this.board[newX][newY];
        if (targetUnit && targetUnit.side === unit.side) return false;

        this.board[prevX][prevY] = null;
        this.board[newX][newY] = unit;

        const isValid = !this.isInCheckPosition(unit.side);

        this.board[prevX][prevY] = unit;
        this.board[newX][newY] = targetUnit;

        return isValid;
    }

    private findAvailablePositions(): AvailablePositions {
        const availablePositions: AvailablePositions = new Map();

        for (let x = 0; x < this.boardSize; x++) {
            for (let y = 0; y < this.boardSize; y++) {
                const unit = this.board[x][y];
                if (!unit || unit.side !== this._playerSide) continue;

                const unitMoves: Move[] = [];

                for (const { x: dx, y: dy } of unit.moves) {
                    let newX = x + dx;
                    let newY = y + dy;

                    if (!this.isMovePossible(newX, newY)) continue;

                    const targetUnit = this.board[newX][newY];
                    if (targetUnit && targetUnit.side === unit.side) continue;

                    if (unit instanceof Pawn) {
                        if ((dx === 2 || dx === -2) && (this.board[newX + (dx === 2 ? -1 : 1)][newY] || targetUnit)) continue;
                        if ((dx === 1 || dx === -1) && dy === 0 && targetUnit) continue;
                        if (dy !== 0 && (!targetUnit || targetUnit.side === unit.side)) continue;
                    }

                    if (unit instanceof Pawn || unit instanceof King || unit instanceof Knight) {
                        if (this.isPositionValidAfter(x, y, newX, newY)) unitMoves.push({ x: newX, y: newY });
                    } else {
                        while (this.isMovePossible(newX, newY)) {
                            const nextUnit = this.board[newX][newY];
                            if (nextUnit && nextUnit.side === unit.side) break;

                            if (this.isPositionValidAfter(x, y, newX, newY)) unitMoves.push({ x: newX, y: newY });

                            if (nextUnit) break;

                            newX += dx;
                            newY += dy;
                        }
                    }
                }
                if (unit instanceof King) {
                    if (this.canCastle(unit, true))
                        unitMoves.push({x, y: 6});
                    if (this.canCastle(unit, true))
                        unitMoves.push({x, y: 2});
                } else if (unit instanceof Pawn && this.canEnPassant(unit, x, y)) {
                    unitMoves.push({x: x + (unit.side === Side.White ? 1 : -1), y: this._lastMove!.prevY});
                }
                if (unitMoves.length) availablePositions.set(`${x},${y}`, unitMoves);
            }
        }
        return availablePositions;
    }

    public move(x: number, y: number, newX: number, newY: number, promotedUnit: FENChar|null): void {
        if (this._isGameOver) throw new Error("Game is over.");
        if (!this.isMovePossible(x, y) || !this.isMovePossible(newX, newY)) return;

        const unit = this.board[x][y];
        if (!unit || unit.side !== this._playerSide) return;

        const unitMoves = this._availablePositions.get(`${x},${y}`);
        if (!unitMoves || !unitMoves.some(move => move.x === newX && move.y === newY)) {
            throw new Error("Invalid move");
        }

        if ((unit instanceof Pawn || unit instanceof Rook || unit instanceof King) && !unit.moved) {
            unit.moved = true;
        }

        const isUnitTaken: boolean = this.board[newX][newY] !== null;

        if (unit instanceof Pawn || isUnitTaken) this.fiftyMoveRuleCounter = 0;
        else this.fiftyMoveRuleCounter += 0.5;

        this.handleSpecialMove(unit, x, y, newX, newY);
        if (promotedUnit) {
            this.board[newX][newY] = this.promoteUnit(promotedUnit);
        } else {
            this.board[newX][newY] = unit;
        }

        this.board[x][y] = null;

        this._lastMove={prevX: x, prevY: y, currX: newX, currY: newY, unit}
        this._playerSide = this._playerSide === Side.White ? Side.Black : Side.White;
        this.isInCheckPosition(this._playerSide, true);
        this._availablePositions = this.findAvailablePositions();

        if (this._playerSide === Side.White) this.fullNumberOfMoves++;
        this._boardFEN = this.FENConverter.convertBoardToFEN(this.board, this._playerSide, this._lastMove, this.fiftyMoveRuleCounter, this.fullNumberOfMoves);
        this.addGameToThreeFoldHistory(this._boardFEN);
        this._isGameOver = this.hasGameEnded();
    }

    private handleSpecialMove(unit: Unit, x: number, y: number, newX: number, newY: number): void {
        if (unit instanceof King && Math.abs(newY - y) === 2) {
            const rookX = x;
            const rookY = newY > y ? 7 : 0;
            const rook = this.board[rookX][rookY] as Rook;
            const rookNewY = newY > y ? 5 : 3;
            this.board[rookX][rookY] = null;
            this.board[rookX][rookNewY] = rook;
            rook.moved = true;
        } else if (
            unit instanceof Pawn && this._lastMove && this._lastMove.unit instanceof Pawn &&
            Math.abs(this._lastMove.currX - this._lastMove.prevX) === 2 &&
            x === this._lastMove.currX && newY === this._lastMove.currY
        ) {
            this.board[this._lastMove.currX][this._lastMove.currY] = null;
        }
    }

    private canEnPassant(pawn: Pawn, pawnX: number, pawnY: number): boolean {
        if (!this._lastMove) return false;
        const {unit, prevX, prevY, currX, currY} = this._lastMove;

        if (
            !(unit instanceof Pawn) ||
            pawn.side !== this._playerSide ||
            Math.abs(currX - prevX) !==2 ||
            pawnX !== currX ||
            Math.abs(pawnY - currY) !== 1
        ) return false;

        const pawnNewX = pawnX + (pawn.side === Side.White ? 1 : -1);
        const pawnNewY = currY;

        this.board[currX][currY] = null;
        const isPositionValid = this.isPositionValidAfter(pawnX, pawnY, pawnNewX, pawnNewY);
        this.board[currX][currY] = unit;

        return isPositionValid;
    }

    private promoteUnit(unitType: FENChar): Knight|Bishop|Rook|Queen {
        if (unitType === FENChar.WhiteKnight || unitType === FENChar.BlackKnight)
            return new Knight(this._playerSide);
        if (unitType === FENChar.WhiteBishop || unitType === FENChar.BlackBishop)
            return new Bishop(this._playerSide);
        if (unitType === FENChar.WhiteRook || unitType === FENChar.BlackRook)
            return new Rook(this._playerSide);
        return new Queen(this._playerSide);
    }

    private hasGameEnded(): boolean {
        if (this.insufficientMaterial()) {
            this._endMessage = "Draw due to insufficient material";
            return true;
        }

        if (!this._availablePositions.size) {
            if (this._checkState.isInCheck) {
                const winner: string = this._playerSide === Side.White ? "Black" : "White";
                this._endMessage = `${winner} won by checkmate!`;
            } else this._endMessage = "Game ended in a stalemate.";
            return true;
        }

        if(this.threeFoldRep) {
            this._endMessage = `Draw due to Three Fold Repetition rule broken.`;
            return true;
        }

        if (this.fiftyMoveRuleCounter === 50) {
            this._endMessage = "Draw due to Fifty Move rule";
            return true;
        }
        return false;
    }

    private addGameToThreeFoldHistory(FEN: string): void {
        const FENKey: string = FEN.split(" ").slice(0,4 ).join("");
        const threeFoldRepValue: number | undefined = this.threeFoldRepHistory.get(FENKey);

        if (threeFoldRepValue === undefined)
            this.threeFoldRepHistory.set(FENKey, 1);
        else {
            if (threeFoldRepValue === 2) {
                this.threeFoldRep = true;
                return;
            }
            this.threeFoldRepHistory.set(FENKey, 2);
        }
    }

    private playerHasOnlyTwoKnightsAndKing(units: { unit: Unit, x: number, y: number }[]): boolean {
        return units.filter(unit => unit.unit instanceof Knight).length === 2;
    }

    private playerHasOnlyBishopsWithSameColorAndKing(units: { unit: Unit, x: number, y: number }[]): boolean {
        const bishops = units.filter(unit => unit.unit instanceof Bishop);
        const areAllBishopsOfSameColor = new Set(bishops.map(bishop => Board.isPositionDark(bishop.x, bishop.y))).size === 1;
        return bishops.length === units.length - 1 && areAllBishopsOfSameColor;
    }

    private insufficientMaterial(): boolean {
        const whiteUnits: { unit: Unit, x: number, y: number }[] = [];
        const blackUnits: { unit: Unit, x: number, y: number }[] = [];

        for (let x = 0; x < this.boardSize; x++) {
            for (let y = 0; y < this.boardSize; y++) {
                const unit: Unit | null = this.board[x][y];
                if (!unit) continue;

                if (unit.side === Side.White) whiteUnits.push({ unit, x, y });
                else blackUnits.push({ unit, x, y });
            }
        }

        // King vs King
        if (whiteUnits.length === 1 && blackUnits.length === 1)
            return true;

        // King and Minor Piece vs King
        if (whiteUnits.length === 1 && blackUnits.length === 2)
            return blackUnits.some(unit => unit.unit instanceof Knight || unit.unit instanceof Bishop);

        else if (whiteUnits.length === 2 && blackUnits.length === 1)
            return whiteUnits.some(unit => unit.unit instanceof Knight || unit.unit instanceof Bishop);

        // both sides have bishop of same color
        else if (whiteUnits.length === 2 && blackUnits.length === 2) {
            const whiteBishop = whiteUnits.find(unit => unit.unit instanceof Bishop);
            const blackBishop = blackUnits.find(unit => unit.unit instanceof Bishop);

            if (whiteBishop && blackBishop) {
                const areBishopsOfSameColor: boolean = Board.isPositionDark(whiteBishop.x, whiteBishop.y) && Board.isPositionDark(blackBishop.x, blackBishop.y) || !Board.isPositionDark(whiteBishop.x, whiteBishop.y) && !Board.isPositionDark(blackBishop.x, blackBishop.y);

                return areBishopsOfSameColor;
            }
        }

        if (whiteUnits.length === 3 && blackUnits.length === 1 && this.playerHasOnlyTwoKnightsAndKing(whiteUnits) ||
            whiteUnits.length === 1 && blackUnits.length === 3 && this.playerHasOnlyTwoKnightsAndKing(blackUnits)
        ) return true;

        if (whiteUnits.length >= 3 && blackUnits.length === 1 && this.playerHasOnlyBishopsWithSameColorAndKing(whiteUnits) ||
            whiteUnits.length === 1 && blackUnits.length >= 3 && this.playerHasOnlyBishopsWithSameColorAndKing(blackUnits)
        ) return true;

        return false;
    }

}
