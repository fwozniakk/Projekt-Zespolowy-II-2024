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
    private _canCastle = false;

    constructor(private unitSide: Side){
        super(unitSide);
        this._fenChar = unitSide === Side.White ? FENChar.WhiteRook : FENChar.BlackRook
    }

    public get canCastle(): boolean {
        return this._canCastle;
    }  

    public set canCastle(_) {
        this._canCastle = true;
    }
}