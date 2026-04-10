import { Component, Inject, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { IButtonSheet } from '../../../services/alert.service';
import Hammer from 'hammerjs';

@Component({
  selector: 'app-action-sheet-container',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDividerModule, TranslateModule],
  templateUrl: './action-sheet.html',
  styleUrls: ['./action-sheet.scss'],
})
export class ActionSheetContainerComponent implements AfterViewInit {
  @ViewChild('actionSheetWrapper', { static: true }) wrapper!: ElementRef;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private bottomSheetRef: MatBottomSheetRef<ActionSheetContainerComponent>
  ) {}

  ngAfterViewInit(): void {
    // Add swipe down to dismiss with finger following
    const hammer = new Hammer(this.wrapper.nativeElement);
    hammer.get('pan').set({ direction: Hammer.DIRECTION_DOWN });
    
    let startY = 0;
    let isDragging = false;
    
    hammer.on('panstart', (ev) => {
      startY = ev.center.y;
      isDragging = true;
      // Remove transition during drag
      this.wrapper.nativeElement.style.transition = 'none';
    });
    
    hammer.on('panmove', (ev) => {
      if (!isDragging) return;
      const deltaY = ev.center.y - startY;
      if (deltaY > 0) { // Only allow downward movement
        this.wrapper.nativeElement.style.transform = `translateY(${deltaY}px)`;
      }
    });
    
    hammer.on('panend', (ev) => {
      isDragging = false;
      // Restore transition
      this.wrapper.nativeElement.style.transition = 'transform 0.3s ease';
      
      const deltaY = ev.deltaY;
      const velocityY = ev.velocityY;
      
      // Reset transform
      this.wrapper.nativeElement.style.transform = '';
      
      // Dismiss if dragged down enough (100px) or fast enough
      if (deltaY > 100 || velocityY > 0.5) {
        this.bottomSheetRef.dismiss();
      }
    });
  }

  onButtonClick(index: number, button: IButtonSheet): void {
    if (button.handler) {
      button.handler();
    }
    this.bottomSheetRef.dismiss({ selectedIndex: index, button });
  }

  onCancel(): void {
    this.bottomSheetRef.dismiss(null);
  }
}

