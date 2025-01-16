import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChessBoardComponent } from './modules/chess-board/chess-board.component';
import { ClassicChessBoardComponent } from './modules/classic-chess-board/classic-chess-board.component';
import { MainPageComponent } from './modules/main-page/main-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChessBoardComponent, ClassicChessBoardComponent, MainPageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [
    {provide: Window, useValue: window}
  ]
})
export class AppComponent {
  title = 'frontend';
}
