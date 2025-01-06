import { FENChar, Side } from "./models";
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

    constructor() {
        this.board = this.initializeBoard();
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
}