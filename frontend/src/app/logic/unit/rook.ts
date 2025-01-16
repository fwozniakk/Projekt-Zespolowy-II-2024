import { FENChar, Move, Side } from "../models";
import { Unit } from "./unit";

export class Rook extends Unit {
    protected override _fenChar: FENChar;
    protected override _moves: Move[] = [
        {x: 1, y: 0},
        {x: -1, y: 0},
        {x: 0, y: 1},
        {x: 0, y: -1},
    ];
    private _moved = false;

    constructor(private unitSide: Side){
        super(unitSide);
        this._fenChar = unitSide === Side.White ? FENChar.WhiteRook : FENChar.BlackRook
    }

    public get moved(): boolean {
        return this._moved;
    }  

    public set moved(_) {
        this._moved = true;
    }
}