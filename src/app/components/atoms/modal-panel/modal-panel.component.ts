import { Component, Inject, OnInit, AfterViewInit, ViewChild, ViewContainerRef, Injector, ComponentRef, ComponentFactoryResolver } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-modal-panel-container',
  standalone: false,
  template: `
    <div class="modal-panel-wrapper" [ngClass]="'panel-' + data.position">
      <div class="panel-header" *ngIf="data.title">
        <h2>{{ data.title }}</h2>
        <button mat-icon-button (click)="onClose()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="panel-content">
        <ng-container *ngIf="data.isHTML">
          <div [innerHTML]="data.component"></div>
        </ng-container>
        <ng-container *ngIf="!data.isHTML" #componentContainer></ng-container>
      </div>
    </div>
  `,
  styles: [`
    .modal-panel-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #fff;

      &.panel-bottom {
        animation: slideUpPanel 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      }

      &.panel-right {
        animation: slideLeftPanel 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      }

      &.panel-left {
        animation: slideRightPanel 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      }

      &.panel-top {
        animation: slideDownPanel 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      }
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      flex-shrink: 0;

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
        color: #333;
      }
    }

    .close-button {
      color: #999;
      &:hover {
        color: #333;
      }
    }

    .panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    @keyframes slideUpPanel {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes slideDownPanel {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes slideLeftPanel {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideRightPanel {
      from {
        transform: translateX(-100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class ModalPanelContainerComponent implements OnInit, AfterViewInit {
  @ViewChild('componentContainer', { read: ViewContainerRef }) container!: ViewContainerRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ModalPanelContainerComponent>,
    private injector: Injector,
    private resolver: ComponentFactoryResolver
  ) {}

  ngOnInit(): void {
    // Data is available here
  }

  ngAfterViewInit(): void {
    // If it's a component, inject it into the container
    if (!this.data.isHTML && this.data.component) {
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

  onClose(): void {
    this.dialogRef.close();
  }
}

