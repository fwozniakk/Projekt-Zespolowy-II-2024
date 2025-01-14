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
    private _moved = false;

    constructor(private unitSide: Side){
        super(unitSide);
        this._moves = this.unitSide === Side.White ? this._moves : this._moves.map(({x, y}) => ({ x: -1 * x, y}));
        this._fenChar = unitSide === Side.White ? FENChar.WhitePawn : FENChar.BlackPawn;
    }

    public get moved(): boolean {
        return this._moved;
    }  

    public set moved(_) {
        this._moved = true;
        if (this.unitSide === Side.White) {
            this._moves = [
                {x: 1, y: 0},
                {x: 1, y: -1},
                {x: 1, y: 1},
            ];
        } else {
            this._moves = [
                {x: -1, y: 0},
                {x: -1, y: -1},
                {x: -1, y: 1},
            ];
        }
    }
}