import { Component, ElementRef, inject, OnDestroy, OnInit } from '@angular/core';
import { ClassicChessBoardComponent } from '../classic-chess-board/classic-chess-board.component';
import { StockfishApiService } from './stockfish-api.service';
import { ClassicChessBoardService } from '../classic-chess-board/classic-chess-board.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-classic-opponent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: '../classic-chess-board/classic-chess-board.component.html',
  styleUrl: '../classic-chess-board/classic-chess-board.component.scss'
})
export class ClassicOpponentComponent extends ClassicChessBoardComponent implements OnInit, OnDestroy {

  private subscriptions$ = new Subscription();

  constructor(private stockfishApiService: StockfishApiService, elRef: ElementRef) {
    super(elRef, inject(ClassicChessBoardService));
  }

  public ngOnInit(): void {
    const boardStateSubscription$: Subscription = this.ClassicChessBoardService.chessBoardState$.subscribe({
      next: async (FEN: string) => {
        const player: string = FEN.split(" ")[1];
        if (player === "w") return;

        const { prevX, prevY, newX, newY, promotedUnit } = await firstValueFrom(this.stockfishApiService.getBestMove(FEN));
        this.updateBoard(prevX, prevY, newX, newY, promotedUnit);
      }
    })

    this.subscriptions$.add(boardStateSubscription$);
  }

  public override ngOnDestroy(): void {
    
    this.subscriptions$.unsubscribe();
    super.ngOnDestroy();
  }

}
