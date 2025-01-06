import { FENChar, Move, Side } from "../models";

export abstract class Unit {
    protected abstract _fenChar: FENChar;
    protected abstract _moves: Move[];

    constructor(private readonly _side: Side){

    }

    public get side(): Side {
        return this._side;
    }

    public get fenChar(): FENChar {
        return this._fenChar;
    }

    public get moves(): Move[] {
        return this._moves;
    }


}