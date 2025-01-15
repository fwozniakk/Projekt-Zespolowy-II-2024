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
    private _playerSide = Side.White;
    private readonly boardSize: number = 8;
    private _availablePositions: AvailablePositions;
    private _checkState: CheckState = { isInCheck: false };
    private _lastMove: LastMove | undefined;

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

    public get availablePositions(): AvailablePositions {
        return this._availablePositions;
    }

    private isMovePossible(x: number, y: number): boolean {
        return x >= 0 && y >= 0 && x < this.boardSize && y < this.boardSize;
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

                if (unitMoves.length) availablePositions.set(`${x},${y}`, unitMoves);
            }
        }
        return availablePositions;
    }

    public move(x: number, y: number, newX: number, newY: number): void {
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

        this.board[x][y] = null;
        this.board[newX][newY] = unit;

        this._playerSide = this._playerSide === Side.White ? Side.Black : Side.White;
        this._availablePositions = this.findAvailablePositions();
    }
}
