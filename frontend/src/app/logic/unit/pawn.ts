import { FENChar, Move, Side } from "../models";
import { Unit } from "./unit";

export class Pawn extends Unit {
    protected override _fenChar: FENChar;
    protected override _moves: Move[] = [
        {x: 1, y: 0},
        {x: 2, y: 0},
        {x: 1, y: -1},
        {x: 1, y: 1},
    ];
    private _canJump = true;

    constructor(private unitSide: Side){
        super(unitSide);
        this._moves = this.unitSide === Side.White ? this._moves : this._moves.map(({x, y}) => ({ x: -1 * x, y}));
        this._fenChar = unitSide === Side.White ? FENChar.WhitePawn : FENChar.BlackPawn;
    }

    public get canJump(): boolean {
        return this._canJump;
    }  

    public set canJump(_) {
        this._canJump = false;
        this._moves = [
            {x: 1, y: 0},
            {x: 1, y: -1},
            {x: 1, y: 1},
        ];
        if (this.unitSide === Side.Black) this._moves.map(({x, y}) => ({ x: -1 * x, y}));
    }
}