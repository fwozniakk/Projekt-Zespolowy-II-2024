import { expect, test } from "bun:test";
import { Board } from "../src/main.ts";

test("Check if all pieces exist on a board in a correct order and type", () => {
  const board = new Board()
  const boardNotation = board.notation()
  expect(entireBoard).toBe("/rnknr/ppppp/5/5/5//buqbu/ppppp/5/5/5//5/5/5/5/5//5/5/5/PPPPP/BUQBU//5/5/5/PPPPP/RNKNR/#w#")
})

test("Check if each piece returns all possible moves")
