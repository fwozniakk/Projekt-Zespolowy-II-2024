import assert from 'node:assert/strict';

type type = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king" | "unicorn";
type shortType = "p" | "r" | "n" | "b" | "q" | "k" | "u";
type color = "white" | "black";

class Position {
  constructor(public x: number, public y: number, public z: number) {}
}

class Piece extends Position {
  private typeToShortType: Record<type, shortType> = {
    "pawn": "p",
    "rook": "r",
    "knight": "n",
    "bishop": "b",
    "queen": "q",
    "king": "k",
    "unicorn": "u"
  }
  private shortTypeToType: Record<shortType, type> = {
    "p": "pawn",
    "r": "rook",
    "n": "knight",
    "b": "bishop",
    "q": "queen",
    "k": "king",
    "u": "unicorn"
  }
  public shortType: shortType;

  constructor(public type: type, public color: color, x: number, y: number, z: number) {
    super(x, y, z);
    this.shortType = this.typeToShortType[this.type]
  }
}

class Move {
  constructor(public from: Position, public to: Position) {}
}

export class Board {
  pieces: Piece[];
  player: color;
  public squares: (Piece | null)[][][] = Array.from({length:5}, () => Array.from({length:5}, () => new Array(5).fill(null)));
  notation: string;

  updateSquares() {
    this.squares = Array.from({length:5}, () => Array.from({length:5}, () => new Array(5).fill(null)));
    for (const piece of this.pieces) {
      this.squares[piece.x-1][piece.y-1][piece.z-1] = piece;
    }
  }

  public updateNotation() {
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

  private parseNotation(notation: string): [Piece[], color] {
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
          pieces.push(new Piece("rook", "black", x, y, z))
          x += 1;
          break;
        case "n":
          pieces.push(new Piece("knight", "black", x, y, z))
          x += 1;
          break;
        case "u":
          pieces.push(new Piece("unicorn", "black", x, y, z))
          x += 1;
          break;
        case "b":
          pieces.push(new Piece("bishop", "black", x, y, z))
          x += 1;
          break;
        case "q":
          pieces.push(new Piece("queen", "black", x, y, z))
          x += 1;
          break;
        case "k":
          pieces.push(new Piece("king", "black", x, y, z))
          x += 1;
          break;
        case "p":
          pieces.push(new Piece("pawn", "black", x, y, z))
          x += 1;
          break;
        case "R":
          pieces.push(new Piece("rook", "white", x, y, z))
          x += 1;
          break;
        case "N":
          pieces.push(new Piece("knight", "white", x, y, z))
          x += 1;
          break;
        case "U":
          pieces.push(new Piece("unicorn", "white", x, y, z))
          x += 1;
          break;
        case "B":
          pieces.push(new Piece("bishop", "white", x, y, z))
          x += 1;
          break;
        case "Q":
          pieces.push(new Piece("queen", "white", x, y, z))
          x += 1;
          break;
        case "K":
          pieces.push(new Piece("king", "white", x, y, z))
          x += 1;
          break;
        case "P":
          pieces.push(new Piece("pawn", "white", x, y, z))
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

  constructor(initArgs: {startNotation: string} | {pieces: Piece[], player: color} = {startNotation: "/rnknr/ppppp/5/5/5//buqbu/ppppp/5/5/5//5/5/5/5/5//5/5/5/PPPPP/BUQBU//5/5/5/PPPPP/RNKNR/#w#"}) {
    if ("startNotation" in initArgs) {
      const startNotation = initArgs.startNotation;
      this.notation = startNotation;
      [this.pieces, this.player] = this.parseNotation(startNotation);
      this.updateSquares();
    } else {
      this.notation = "";
      this.pieces = initArgs.pieces;
      this.player = initArgs.player;
      this.updateSquares();
      this.updateNotation();
    }
  }

  private generateMovesInDirection(pos: Position, xDir: number, yDir: number, zDir: number) {
    const moves: Move[] = [];
    let currentPos = new Position(pos.x + xDir, pos.y + yDir, pos.z + zDir);
    while (currentPos.x > 0 && currentPos.x <= 5 &&
           currentPos.y > 0 && currentPos.y <= 5 &&
           currentPos.z > 0 && currentPos.z <= 5) {
      const currentSquare = this.squares[currentPos.x-1][currentPos.y-1][currentPos.z-1];
      if (currentSquare !== null) {
        if (currentSquare.color !== this.player) {
          moves.push(new Move(pos, currentPos));
        }
        break;
      }
      moves.push(new Move(pos, currentPos));
      currentPos = new Position(currentPos.x + xDir, currentPos.y + yDir, currentPos.z + zDir);
    }
    return moves;
  }

  private generateSlidingMoves(pos: Position, type: type) {
    const moves: Move[] = [];
    switch(type) {
      case "queen":
        for (let xDir = -1; xDir <= 1; xDir++){
          for (let yDir = -1; yDir <= 1; yDir++){
            for (let zDir = -1; zDir <= 1; zDir++){
              if (xDir === 0 && yDir === 0 && zDir === 0) {
                continue; // Cannot move into itself
              }
              moves.push(...this.generateMovesInDirection(pos, xDir, yDir, zDir));
            }
          }
        }
        break;
      case "rook":
        for (let dim = 0; dim < 3; dim++) {
          for (let dir = -1; dir <= 1; dir += 2) {
            const xDir = dim === 0 ? dir : 0;
            const yDir = dim === 1 ? dir : 0;
            const zDir = dim === 2 ? dir : 0;
            moves.push(...this.generateMovesInDirection(pos, xDir, yDir, zDir));
          }
        }
        break;
      case "bishop":
        for (let dir = -1; dir <= 1; dir += 2) {
          for (let dir2 = -1; dir2 <= 1; dir2 += 2) {
            moves.push(...this.generateMovesInDirection(pos, 0, dir, dir2));
            moves.push(...this.generateMovesInDirection(pos, dir, 0, dir2));
            moves.push(...this.generateMovesInDirection(pos, dir, dir2, 0));
          }
        }
        break;
      case "unicorn":
        for (let xDir = -1; xDir <= 1; xDir += 2){
          for (let yDir = -1; yDir <= 1; yDir += 2){
            for (let zDir = -1; zDir <= 1; zDir += 2){
              moves.push(...this.generateMovesInDirection(pos, xDir, yDir, zDir));
            }
          }
        }
        break;
    }
    return moves;
  }

  public possibleMovesPseudoLegal(): Move[] {
    const moves: Move[] = [];
    for (const piece of this.pieces) {
      if (piece.color !== this.player) {
        continue;
      }
      switch (piece.type) {
        case "pawn":
          const [x,y,z] = [piece.x, piece.y, piece.z];
          assert.equal(((piece.color === "white" && z < 5 && y < 5) || (piece.color === "black" && z > 1 && y > 1)), true, "Pawn should be promoted");
          const sqrs = this.squares
          if (piece.color === "white") {
            // Forward
            if (sqrs[x-1][y][z-1] === null) {
              moves.push(new Move(new Position(x, y, z), new Position(x, y + 1, z)));
            }
            if (sqrs[x-1][y-1][z] === null) {
              moves.push(new Move(new Position(x, y, z), new Position(x, y, z + 1)));
            }

            // Capture
            if (x > 1 && sqrs[x-2][y][z-1] !== null && sqrs[x-2][y][z-1]!.color === "black") {
              moves.push(new Move(new Position(x, y, z), new Position(x - 1, y + 1, z)));
            }
            if (x < 5 && sqrs[x][y][z-1] !== null && sqrs[x][y][z-1]!.color === "black") {
              moves.push(new Move(new Position(x, y, z), new Position(x + 1, y + 1, z)));
            }
            if (x > 1 && sqrs[x-2][y-1][z] !== null && sqrs[x-2][y-1][z]!.color === "black") {
              moves.push(new Move(new Position(x, y, z), new Position(x - 1, y, z+1)));
            }
            if (x < 5 && sqrs[x][y-1][z] !== null && sqrs[x][y-1][z]!.color === "black") {
              moves.push(new Move(new Position(x, y, z), new Position(x + 1, y, z+1)));
            }
          } else {
            // Forward
            if (sqrs[x-1][y-2][z-1] === null) {
              moves.push(new Move(new Position(x, y, z), new Position(x, y - 1, z)));
            }
            if (sqrs[x-1][y-1][z-2] === null) {
              moves.push(new Move(new Position(x, y, z), new Position(x, y, z - 1)));
            }

            // Capture
            if (x > 1 && sqrs[x-2][y-2][z-1] !== null && sqrs[x-2][y-2][z-1]!.color === "white") {
              moves.push(new Move(new Position(x, y, z), new Position(x - 1, y - 1, z)));
            }
            if (x < 5 && sqrs[x][y-2][z-1] !== null && sqrs[x][y-2][z-1]!.color === "white") {
              moves.push(new Move(new Position(x, y, z), new Position(x + 1, y - 1, z)));
            }
            if (x > 1 && sqrs[x-2][y-1][z-2] !== null && sqrs[x-2][y-1][z-2]!.color === "white") {
              moves.push(new Move(new Position(x, y, z), new Position(x - 1, y, z-1)));
            }
            if (x < 5 && sqrs[x][y-1][z-2] !== null && sqrs[x][y-1][z-2]!.color === "white") {
              moves.push(new Move(new Position(x, y, z), new Position(x + 1, y, z-1)));
            }
          }
          break;
        case "knight":
          for(let i = 0; i < 6; i++) {
            for (let dir = -1; dir <= 1; dir += 2){
              for (let dir2 = -2; dir2 <= 2; dir2 += 4){
                let dirs: number[];
                if (i%2 === 0) {
                  dirs = [dir2, dir];
                } else {
                  dirs = [dir, dir2]
                }
                dirs.splice(i%3, 0, 0);
                const [x, y, z] = [piece.x, piece.y, piece.z];
                const [xDir, yDir, zDir] = dirs;

                if (Math.min(x + xDir, y + yDir, z + zDir) < 1 || Math.max(x + xDir, y + yDir, z + zDir) > 5) {
                  continue;
                }
                  
                if (this.squares[x + xDir - 1][y + yDir - 1][z + zDir - 1] === null || this.squares[x + xDir - 1][y + yDir - 1][z + zDir - 1]!.color !== this.player) {
                  moves.push(new Move(new Position(piece.x, piece.y, piece.z), new Position(piece.x + xDir, piece.y + yDir, piece.z + zDir)));
                }
              }
            }
          }
          break;
        case "king":
          for (let xDir = -1; xDir <= 1; xDir++){
            for (let yDir = -1; yDir <= 1; yDir++){
              for (let zDir = -1; zDir <= 1; zDir++){
                if (xDir === 0 && yDir === 0 && zDir === 0) { // Theoretically unnecessary
                  continue; // Cannot move into itself
                }
                const [x, y, z] = [piece.x, piece.y, piece.z];
                if (Math.min(x + xDir, y + yDir, z + zDir) < 1 || Math.max(x + xDir, y + yDir, z + zDir) > 5) {
                  continue;
                }
                if (this.squares[x + xDir - 1][y + yDir - 1][z + zDir - 1] === null || this.squares[x + xDir - 1][y + yDir - 1][z + zDir - 1]!.color !== this.player) {
                  moves.push(new Move(new Position(x, y, z), new Position(x + xDir, y + yDir, z + zDir)));
                }
              }
            }
          }
          break;
        default:
          moves.push(...this.generateSlidingMoves(new Position(piece.x, piece.y, piece.z), piece.type));
          break;
      }
    }
    return moves;
  }
  public possibleMoves(): Move[] {
    const pseudoMoves = this.possibleMovesPseudoLegal();
    const legalMoves: Move[] = [];
    for (const move of pseudoMoves) {
      const newBoard = this.applyMove(move);
      if (!newBoard.canCaptureKing()) {
        legalMoves.push(move);
      }
    }
    return legalMoves;
  }
  public applyMove(move: Move): Board {
    const piece = this.squares[move.from.x-1][move.from.y-1][move.from.z-1];
    assert(piece !== null);
    assert(piece.color === this.player);
    const targetPiece = this.squares[move.to.x-1][move.to.y-1][move.to.z-1];
    assert(targetPiece === null || targetPiece.color !== this.player);
    const pieces = [...this.pieces]
    pieces.filter(p => p === piece)
    if (targetPiece !== null) {
      pieces.filter(p => p === targetPiece)
    }
    pieces.push(new Piece(piece.type, piece.color, move.to.x, move.to.y, move.to.z));
    const updatedBoard = new Board({pieces: pieces, player: (this.player === "white") ? "black" : "white"});
    return updatedBoard;
  }

  public canCaptureKing(): boolean {
    const moves = this.possibleMovesPseudoLegal();
    for (const move of moves) {
      const piece = this.squares[move.to.x-1][move.to.y-1][move.to.z-1];
      if (piece !== null && piece.type === "king" && piece.color !== this.player) {
        return true;
      }
    }
    return false;
  }
}

const board = new Board();
