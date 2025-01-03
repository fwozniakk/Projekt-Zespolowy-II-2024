import assert from 'node:assert/strict';

type type = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king" | "unicorn";
type color = "white" | "black";

class Piece {
  constructor(public type: type, public color: color, public x: number, public y: number, public z: number) {
    this.type = type;
    this.color = color;
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

class Board {
  pieces: Piece[];
  player: color;
  parseNotation(notation: string): [Piece[], color] {
    const boardStart = notation.indexOf("/");
    const boardEnd = notation.lastIndexOf("/");
    const statusStart = notation.indexOf("#");
    const statusEnd = notation.lastIndexOf("#");

    const pieces = [];
    let z = 5;
    let y = 5;
    let x = 1;
    for (let i = boardStart + 1; i < boardEnd; i++) {
      const char = notation[i];
      switch (char) {
        case "/":
          if (i + 1 < boardEnd && notation[i + 1] === "/") {
            z -= 1;
            y = 5;
            x = 1;
          } else {
            y -= 1;
            x = 1;
          }
          break;
        case "r":
          pieces.push(new Piece("rook", "white", x, y, z))
          x += 1;
          break;
        case "n":
          pieces.push(new Piece("knight", "white", x, y, z))
          x += 1;
          break;
        case "u":
          pieces.push(new Piece("unicorn", "white", x, y, z))
          x += 1;
          break;
        case "b":
          pieces.push(new Piece("bishop", "white", x, y, z))
          x += 1;
          break;
        case "q":
          pieces.push(new Piece("queen", "white", x, y, z))
          x += 1;
          break;
        case "k":
          pieces.push(new Piece("king", "white", x, y, z))
          x += 1;
          break;
        case "p":
          pieces.push(new Piece("pawn", "white", x, y, z))
          x += 1;
          break;
        case "R":
          pieces.push(new Piece("rook", "black", x, y, z))
          x += 1;
          break;
        case "N":
          pieces.push(new Piece("knight", "black", x, y, z))
          x += 1;
          break;
        case "U":
          pieces.push(new Piece("unicorn", "black", x, y, z))
          x += 1;
          break;
        case "B":
          pieces.push(new Piece("bishop", "black", x, y, z))
          x += 1;
          break;
        case "Q":
          pieces.push(new Piece("queen", "black", x, y, z))
          x += 1;
          break;
        case "K":
          pieces.push(new Piece("king", "black", x, y, z))
          x += 1;
          break;
        case "P":
          pieces.push(new Piece("pawn", "black", x, y, z))
          x += 1;
          break;
      }
    }
    let player: color | undefined = undefined;
    for (let i = statusStart + 1; i < statusEnd; i++) {
      const char = notation[i];
      switch (char) {
        case "w":
          player = "white";
          break;
        case "b":
          player = "black";
          break;
      }
    }

    assert(player !== undefined);

    return [pieces, player];
  }

  constructor(private startNotation = "/rnknr/ppppp/8/8/8//buqbu/ppppp/8/8/8//8/8/8/8/8//8/8/8/PPPPP/BUQBU//8/8/8/PPPPP/RNKNR/#w#") {
    [this.pieces, this.player] = this.parseNotation(startNotation);
  }
}

new Board();
