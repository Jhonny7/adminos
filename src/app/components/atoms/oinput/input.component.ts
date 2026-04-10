import { Component, Input, Output, EventEmitter, OnInit, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { InputInterface } from './input.types';

@Component({
  selector: 'app-oinput',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  standalone: false
})
export class OInputComponent implements OnInit {
  @Input() inputData: InputInterface;
  @Input() index: number = 0;
  @Input() extraClass: string = '';
  @Input() globalExtraClass: string = '';
  
  @Output() change = new EventEmitter<{ data: InputInterface; index: number }>();
  @Output() blur = new EventEmitter<{ data: InputInterface; index: number }>();

  currentType: string;

  constructor() {}

  ngOnInit(): void {
    this.currentType = this.inputData.forceType || this.inputData.type;
  }

  onInputChange(data: InputInterface): void {
    this.change.emit({ data, index: this.index });
  }

  onInputBlur(data: InputInterface): void {
    this.blur.emit({ data, index: this.index });
  }

  getComponentClass(): string {
    const baseClass = `${this.globalExtraClass} ${this.extraClass} ${this.inputData.globalExtraClass || ''} gp-form`;
    return this.inputData.type === 'between' ? `${baseClass} between-dates` : baseClass;
  }
}
