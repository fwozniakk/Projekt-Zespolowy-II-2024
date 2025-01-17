import { Routes } from '@angular/router';
import { ClassicChessBoardComponent } from './modules/classic-chess-board/classic-chess-board.component';
import { ChessBoardComponent } from './modules/chess-board/chess-board.component';
import { MainPageComponent } from './modules/main-page/main-page.component';
import { ClassicOpponentComponent } from './modules/classic-opponent/classic-opponent.component';

export const routes: Routes = [
    { path: 'classic', component: ClassicChessBoardComponent },
    { path: 'classic-vscomputer', component: ClassicOpponentComponent },
    { path: 'raumschach', component: ChessBoardComponent },
    { path: '', component: MainPageComponent },
    { path: '', redirectTo: '/', pathMatch: 'full'},
    { path: '**', redirectTo: '/' } 
];
