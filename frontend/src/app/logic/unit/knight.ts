import { FENChar, Move, Side } from "../models";
import { Unit } from "./unit";

export class Knight extends Unit {
    protected override _fenChar: FENChar;
    protected override _moves: Move[] = [
        {x: 1, y: 2},
        {x: 1, y: -2},
        {x: -1, y: 2},
        {x: -1, y: -2},
        {x: 2, y: 1},
        {x: 2, y: -1},
        {x: -2, y: 1},
        {x: -2, y: -1},
    ];

    constructor(private unitSide: Side){
        super(unitSide);
        this._fenChar = unitSide === Side.White ? FENChar.WhiteKnight : FENChar.BlackKnight
    }
}