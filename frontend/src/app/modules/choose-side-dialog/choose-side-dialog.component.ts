import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-choose-side-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './choose-side-dialog.component.html',
  styleUrl: './choose-side-dialog.component.scss'
})
export class ChooseSideDialogComponent {
  public difficulty: readonly number[] = [1, 2, 3, 4, 5];
  public currentDifficulty: number = 1;

  
}
