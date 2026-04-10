import { Component, Inject, OnInit, AfterViewInit, ViewChild, ViewContainerRef, Injector, ComponentRef, ComponentFactoryResolver } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { IButtonSheet } from '../../../services/alert.service';

@Component({
  selector: 'app-popover-container',
  standalone: false,
  template: `
    <div class="popover-wrapper">
      <div class="popover-header" *ngIf="data.title">
        <h3>{{ data.title }}</h3>
      </div>

      <div class="popover-content">
        <ng-container *ngIf="data.isComponent" #componentContainer></ng-container>
        <ng-container *ngIf="!data.isComponent">
          <button 
            mat-button 
            *ngFor="let btn of data.buttons; let idx = index"
            class="popover-item"
            (click)="onButtonClick(idx, btn)">
            <mat-icon *ngIf="btn.icon" class="popover-icon">{{ btn.icon }}</mat-icon>
            <span class="popover-label">{{ btn.text }}</span>
          </button>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .popover-wrapper {
      min-width: 200px;
      max-width: 300px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    }

    .popover-header {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      text-align: center;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
    }

    .popover-content {
      padding: 8px 0;
    }

    .popover-item {
      width: 100%;
      padding: 12px 16px;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 12px;
      border-radius: 0;
      color: #333;
      font-size: 14px;
      justify-content: flex-start;

      &:hover {
        background-color: #f5f5f5;
      }
    }

    .popover-icon {
      flex-shrink: 0;
      color: #666;
    }

    .popover-label {
      flex: 1;
    }
  `]
})
export class PopoverContainerComponent implements OnInit, AfterViewInit {
  @ViewChild('componentContainer', { read: ViewContainerRef }) container!: ViewContainerRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PopoverContainerComponent>,
    private injector: Injector,
    private resolver: ComponentFactoryResolver
  ) {}

  ngOnInit(): void {
    // Data is available here
  }

  ngAfterViewInit(): void {
    // If it's a component, inject it into the container
    if (this.data.isComponent && this.data.component) {
      this.injectComponent();
    }
  }

  private injectComponent(): void {
    try {
      const factory = this.resolver.resolveComponentFactory(this.data.component);
      const componentRef = this.container.createComponent(factory);
      
      // Pass data to the component if available
      if (this.data.componentData && componentRef.instance) {
        Object.assign(componentRef.instance, this.data.componentData);
      }
    } catch (error) {
      console.error('Error creating component:', error);
    }
  }

  onButtonClick(index: number, button: IButtonSheet): void {
    if (button.handler) {
      button.handler();
    }
    this.dialogRef.close({ selectedIndex: index, button });
  }
}