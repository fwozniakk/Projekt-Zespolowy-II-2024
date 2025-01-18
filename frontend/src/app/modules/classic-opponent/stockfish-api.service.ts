import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Move, StockfishResponse, StockfishQuery } from './models';
import { Observable, of, switchMap } from 'rxjs';
import { FENChar, Side } from '../../logic/models';

@Injectable({
  providedIn: 'root'
})
export class StockfishApiService {
  private readonly api: string = "https://stockfish.online/api/s/v2.php";

  constructor(private http: HttpClient) { }


  public getBestMove(fen: string): Observable<Move> {
    const queryParams: StockfishQuery = {
      fen,
      depth: 13
    };

    let params = new HttpParams().appendAll(queryParams);

    return this.http.get<StockfishResponse>(this.api, { params })
      .pipe(
        switchMap(response => {
          console.log(response)
          const bestMove: string = response.bestmove.split(" ")[1];
          return of(this.moveFromStockfishString(bestMove))
        })
      )
  }

  private promotedUnit(piece: string | undefined): FENChar | null {
    if (!piece) return null;
    if (piece === "n") return FENChar.BlackKnight;
    if (piece === "b") return FENChar.BlackBishop;
    if (piece === "r") return FENChar.BlackRook;
    return FENChar.BlackQueen;
  }

  private moveFromStockfishString(move: string): Move {
    const prevY: number = this.convertColumnLetter(move[0]);
    const prevX: number = Number(move[1]) - 1;
    const newY: number = this.convertColumnLetter(move[2]);
    const newX: number = Number(move[3]) - 1;
    const promotedUnit = this.promotedUnit(move[4]);
    return { prevX, prevY, newX, newY, promotedUnit };
  }

  private convertColumnLetter(string: string): number {
    return string.charCodeAt(0) - "a".charCodeAt(0);
  }
}
