import { FenParser } from '@chess-fu/fen-parser';

class Piece {
  constructor(public type: string, public color: string, public x: number, public y: number) {
    this.type = type;
    this.color = color;
    this.x = x;
    this.y = y;
  }
}

class Board {
  constructor(fen: FenParser){
    
  }
  private fenToPieces(fen: FenParser): Piece[] {
    const pieceArray: Piece[] = [];
    for (let i = 0; i < fen.board.length; i++) {
      for (let j = 0; j < fen.board[0].length; j++) {
        let piece = fen.board[i][j];
        let color = 'white';
        if (piece === piece.toLowerCase()) {
          color = 'black';
        }
        piece = piece.toLowerCase();
        pieceArray.push(new Piece(piece, color, i, j));
      }
    }
  }
}

const board = new Board(new FenParser('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'))
