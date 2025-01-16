import { Routes } from '@angular/router';
import { ClassicChessBoardComponent } from './modules/classic-chess-board/classic-chess-board.component';
import { ChessBoardComponent } from './modules/chess-board/chess-board.component';
import { MainPageComponent } from './modules/main-page/main-page.component';

export const routes: Routes = [
    { path: 'classic', component: ClassicChessBoardComponent },
    { path: 'raumschach', component: ChessBoardComponent },
    { path: 'main', component: MainPageComponent },
    { path: '', redirectTo: '/main', pathMatch: 'full'},
];
