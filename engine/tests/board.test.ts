import { expect, test } from "bun:test";
import { Board, Move, Position } from "../src/main.ts";

test("Check if all pieces exist on a board in a correct order and type", () => {
  const board = new Board();
  board.updateNotation();
  const boardNotation = board.notation;
  expect(boardNotation).toBe("/rnknr/ppppp/5/5/5//buqbu/ppppp/5/5/5//5/5/5/5/5//5/5/5/PPPPP/BUQBU//5/5/5/PPPPP/RNKNR/#w#");
})

test("Check if all possible moves on start position are correct", () => {
  const expectedMoves = [
    new Move(new Position(1, 2, 2), new Position(1, 3, 2)),
    new Move(new Position(1, 2, 2), new Position(1, 2, 3)),
    new Move(new Position(2, 2, 2), new Position(2, 3, 2)),
    new Move(new Position(2, 2, 2), new Position(2, 2, 3)),
    new Move(new Position(3, 2, 2), new Position(3, 3, 2)),
    new Move(new Position(3, 2, 2), new Position(3, 2, 3)),
    new Move(new Position(4, 2, 2), new Position(4, 3, 2)),
    new Move(new Position(4, 2, 2), new Position(4, 2, 3)),
    new Move(new Position(5, 2, 2), new Position(5, 3, 2)),
    new Move(new Position(5, 2, 2), new Position(5, 2, 3)),
    new Move(new Position(1, 1, 2), new Position(1, 2, 3)),
    new Move(new Position(1, 1, 2), new Position(1, 3, 4)),
    new Move(new Position(1, 1, 2), new Position(1, 4, 5)),
    new Move(new Position(1, 1, 2), new Position(2, 1, 3)),
    new Move(new Position(1, 1, 2), new Position(3, 1, 4)),
    new Move(new Position(1, 1, 2), new Position(4, 1, 5)),
    new Move(new Position(2, 1, 2), new Position(1, 2, 3)),
    new Move(new Position(2, 1, 2), new Position(3, 2, 3)),
    new Move(new Position(2, 1, 2), new Position(4, 3, 4)),
    new Move(new Position(2, 1, 2), new Position(5, 4, 5)),
    new Move(new Position(3, 1, 2), new Position(2, 1, 3)),
    new Move(new Position(3, 1, 2), new Position(1, 1, 4)),
    new Move(new Position(3, 1, 2), new Position(2, 2, 3)),
    new Move(new Position(3, 1, 2), new Position(1, 3, 4)),
    new Move(new Position(3, 1, 2), new Position(3, 1, 3)),
    new Move(new Position(3, 1, 2), new Position(3, 1, 4)),
    new Move(new Position(3, 1, 2), new Position(3, 1, 5)),
    new Move(new Position(3, 1, 2), new Position(3, 2, 3)),
    new Move(new Position(3, 1, 2), new Position(3, 3, 4)),
    new Move(new Position(3, 1, 2), new Position(3, 4, 5)),
    new Move(new Position(3, 1, 2), new Position(4, 1, 3)),
    new Move(new Position(3, 1, 2), new Position(5, 1, 4)),
    new Move(new Position(3, 1, 2), new Position(4, 2, 3)),
    new Move(new Position(3, 1, 2), new Position(5, 3, 4)),
    new Move(new Position(4, 1, 2), new Position(3, 1, 3)),
    new Move(new Position(4, 1, 2), new Position(2, 1, 4)),
    new Move(new Position(4, 1, 2), new Position(1, 1, 5)),
    new Move(new Position(4, 1, 2), new Position(4, 2, 3)),
    new Move(new Position(4, 1, 2), new Position(4, 3, 4)),
    new Move(new Position(4, 1, 2), new Position(4, 4, 5)),
    new Move(new Position(4, 1, 2), new Position(5, 1, 3)),
    new Move(new Position(5, 1, 2), new Position(4, 2, 3)),
    new Move(new Position(5, 1, 2), new Position(3, 3, 4)),
    new Move(new Position(5, 1, 2), new Position(2, 4, 5)),
    new Move(new Position(1, 2, 1), new Position(1, 3, 1)),
    new Move(new Position(2, 2, 1), new Position(2, 3, 1)),
    new Move(new Position(3, 2, 1), new Position(3, 3, 1)),
    new Move(new Position(4, 2, 1), new Position(4, 3, 1)),
    new Move(new Position(5, 2, 1), new Position(5, 3, 1)),
    new Move(new Position(2, 1, 1), new Position(2, 3, 2)),
    new Move(new Position(2, 1, 1), new Position(1, 1, 3)),
    new Move(new Position(2, 1, 1), new Position(3, 1, 3)),
    new Move(new Position(2, 1, 1), new Position(2, 2, 3)),
    new Move(new Position(2, 1, 1), new Position(1, 3, 1)),
    new Move(new Position(2, 1, 1), new Position(3, 3, 1)),
    new Move(new Position(4, 1, 1), new Position(4, 3, 2)),
    new Move(new Position(4, 1, 1), new Position(3, 1, 3)),
    new Move(new Position(4, 1, 1), new Position(5, 1, 3)),
    new Move(new Position(4, 1, 1), new Position(4, 2, 3)),
    new Move(new Position(4, 1, 1), new Position(3, 3, 1)),
    new Move(new Position(4, 1, 1), new Position(5, 3, 1)),
  ]
  const board = new Board();
  const givenMoves = board.possibleMoves();
  const givenMovesMap: Map<string, string[]> = new Map();
  for (const move of givenMoves) {
    const from = move.from.toString();
    const to = move.to.toString();
    if (givenMovesMap.has(from)) {
      givenMovesMap.get(from)!.push(to);
    } else {
      givenMovesMap.set(from, [to]);
    }
  }
  const expectedMovesMap: Map<string, string[]> = new Map();
  for (const move of expectedMoves) {
    const from = move.from.toString();
    const to = move.to.toString();
    if (expectedMovesMap.has(from)) {
      expectedMovesMap.get(from)!.push(to);
    } else {
      expectedMovesMap.set(from, [to]);
    }
  }
  for (const [key, value] of givenMovesMap) {
    expect(expectedMovesMap.has(key))
    expect(value.sort()).toEqual(expectedMovesMap.get(key)!.sort());
  }
})
