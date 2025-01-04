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

export class Board {
  pieces: Piece[];
  player: color;
  squares: (Piece | null)[][][] = Array.from({length:5}, () => Array.from({length:5}, () => new Array(5).fill(null)));
  notation: string;

  updateSquares() {
    this.squares = Array.from({length:5}, () => Array.from({length:5}, () => new Array(5).fill(null)));
    for (const piece of this.pieces) {
      console.log(piece, piece.x, piece.y, piece.z,this.squares[piece.x-1][piece.y-1][piece.z-1]);
      this.squares[piece.x-1][piece.y-1][piece.z-1] = piece;
    }
  }

  updateNotation() {
    this.notation = "/";
    let xCounter = 0;
    for (let z = 4; z >= 0; z--) {
      for (let y = 4; y >= 0; y--) {
        for (let x = 0; x <= 4; x++) {
          const piece = this.squares[x][y][z];
          if (piece === null) {
            xCounter++;
          } else {
            if (xCounter > 0) {
              this.notation += xCounter.toString();
              xCounter = 0;
            }
            let char = "";
            switch (piece.type) {
              case "pawn":
                char = piece.color === "white" ? "p" : "P";
                break;
              case "rook":
                char = piece.color === "white" ? "r" : "R";
                break;
              case "knight":
                char = piece.color === "white" ? "n" : "N";
                break;
              case "bishop":
                char = piece.color === "white" ? "b" : "B";
                break;
              case "queen":
                char = piece.color === "white" ? "q" : "Q";
                break;
              case "king":
                char = piece.color === "white" ? "k" : "K";
                break;
              case "unicorn":
                char = piece.color === "white" ? "u" : "U";
                break;
            }
            this.notation += char;
          }
        }
        if (xCounter > 0) {
          this.notation += xCounter.toString();
          xCounter = 0;
        }
        this.notation += "/";
      }
      if (z !== 0) {
      this.notation += "/"
      }
    }
    this.notation += `#${this.player === "white" ? "w" : "b"}#`
  }

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
            i++;
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
        default:
          x += parseInt(char);
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

  constructor(private startNotation: string = "/rnknr/ppppp/5/5/5//buqbu/ppppp/5/5/5//5/5/5/5/5//5/5/5/PPPPP/BUQBU//5/5/5/PPPPP/RNKNR/#w#") {
    this.notation = startNotation;
    [this.pieces, this.player] = this.parseNotation(startNotation);
    this.updateSquares();
    this.updateNotation();
    console.log(this.squares);
    console.log(this.notation);
  }
}

new Board();
