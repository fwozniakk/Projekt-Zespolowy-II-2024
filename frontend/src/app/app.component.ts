import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainPageComponent } from './modules/main-page/main-page.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MainPageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [
    {provide: Window, useValue: window}
  ]
})
export class AppComponent {
  title = 'Chess';
}
