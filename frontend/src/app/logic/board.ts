import { AvailablePositions, FENChar, Side, Move } from "./models";
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


    constructor() {
        this.board = this.initializeBoard();
        this._availablePositions = this.findAvailablePositions();
    }

    private initializeBoard(): (Unit | null)[][] {
        const createRow = (side: Side, pieces: (new (side: Side) => Unit)[]): (Unit | null)[] =>
            pieces.map(piece => new piece(side));


        return [
            createRow(Side.White, [Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook]),
            Array(8).fill(new Pawn(Side.White)),
            ...Array(4).fill(Array(8).fill(null)),
            Array(8).fill(new Pawn(Side.Black)),
            createRow(Side.Black, [Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook])
        ];
    }

    public get playerSide(): Side {
        return this._playerSide;
    }

    public get playerBoard(): (FENChar|null)[][] {
        return this.board.map(x => {
            return x.map(y => y instanceof Unit ? y.fenChar : null)
        })
    }

    public get availablePositions(): AvailablePositions {
        return this._availablePositions;
    }

    private isMovePossible(x: number, y: number): boolean {
        return x >= 0 && y >= 0 && x < this.boardSize && y < this.boardSize;
    }

    public isInCheckPosition(playerSide: Side): boolean {
        for (let x = 0; x < this.boardSize; x++) {
            for (let y = 0; y < this.boardSize; y++) {
                const unit: Unit | null = this.board[x][y];
                if (!unit || unit.side === playerSide) continue;
    
                for (const { x: dx, y: dy } of unit.moves) {
                    let newX: number = x + dx;
                    let newY: number = y + dy;
    
                    if (!this.isMovePossible(newX, newY)) continue;
    
                    if (unit instanceof Pawn || unit instanceof King || unit instanceof Knight) {
                        if (unit instanceof Pawn && dy === 0) continue;
    
                        const unitThreatened: Unit | null = this.board[newX]?.[newY] ?? null; // Safely access the board
                        if (unitThreatened instanceof King && unitThreatened.side == playerSide) return true;
                    } else {
                        while (this.isMovePossible(newX, newY)) {
                            const unitThreatened: Unit | null = this.board[newX]?.[newY] ?? null;
                            if (unitThreatened instanceof King && unitThreatened.side == playerSide) return true;
    
                            if (unitThreatened !== null) break;
    
                            newX += dx;
                            newY += dy;
                        }
                    }
                }
            }
        }
        return false;
    }
    
    private isPositionValidAfter(unit: Unit, prevX: number, prevY: number, newX: number, newY: number): boolean {
        const newUnit: Unit|null = this.board[newX][newY];

        if(newUnit && newUnit.side === unit.side) return false;

        this.board[prevX][prevY] = null;
        this.board[newX][newY] = unit;
        const isPositionValid: boolean = !this.isInCheckPosition(unit.side);

        this.board[prevX][prevY] = unit;
        this.board[newX][newY] = newUnit;

        return isPositionValid;
    }

    private findAvailablePositions(): AvailablePositions {
        const availablePositions: AvailablePositions = new Map<string, Move[]>();

        for (let x = 0; x < this.boardSize; x++) {
            for (let y = 0; y < this.boardSize; y++) {
                const unit: Unit|null = this.board[x][y];
                if(!unit || unit.side !== this._playerSide) continue;

                const unitAvailablePositions: Move[] = [];

                for (const {x: dx, y: dy} of unit.moves){
                    let newX: number = x + dx;
                    let newY: number = y + dy;

                    if (!this.isMovePossible(newX, newY)) continue;

                    let newUnit: Unit|null = this.board[newX][newY];
                    if(newUnit && newUnit.side == unit.side) continue;

                    // no moving 2 spots or 1 for pawn if there is an unit right in front
                    if (unit instanceof Pawn) {
                        const direction = unit.side === Side.White ? 1 : -1;
                    
                        // ruch dwa pola w przód - tylko z pozycji startowej
                        if (dx === 2 * direction || dx === -2 * direction) {
                            const startRow = unit.side === Side.White ? 1 : this.boardSize - 2; 
                            if (x !== startRow) continue;
                            if (newUnit) continue; // pole docelowe nie może być zajęte
                            if (this.board[x + direction][y]) continue; // pole pomiędzy musi być puste
                        }
                    
                        if (dx === direction && dy === 0 && newUnit) continue;

                        if (dx === direction && Math.abs(dy) === 1 && (!newUnit || newUnit.side === unit.side)) continue;
                    }


                    if (unit instanceof Pawn || unit instanceof King || unit instanceof Knight) {
                        if (this.isPositionValidAfter(unit, x, y, newX, newY))
                            unitAvailablePositions.push({x: newX, y: newY});
                    } else {
                        while(this.isMovePossible(newX, newY)) {
                            newUnit = this.board[newX][newY];
                            if (newUnit && newUnit.side == unit.side) break;

                            if (this.isPositionValidAfter(unit, x, y, newX, newY))
                                unitAvailablePositions.push({x: newX, y: newY});

                            if (newUnit !== null) break;

                            newX += dx;
                            newY += dy;
                        }
                    }
                }
                if (unitAvailablePositions.length) {
                    availablePositions.set(x + "," + y, unitAvailablePositions);
                }
            }
        }
        return availablePositions;
    }
}