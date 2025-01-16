import { Component } from '@angular/core';
import { ChessBoardComponent } from '../chess-board/chess-board.component';
import { ClassicChessBoardComponent } from '../classic-chess-board/classic-chess-board.component';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [ChessBoardComponent, ClassicChessBoardComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent {

}
