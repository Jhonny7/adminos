import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { InputInterface } from './input.types';

@Component({
  selector: 'app-oinput-text',
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss'],
  standalone: false
})
export class OInputTextComponent implements OnInit {
  @Input() inputData: InputInterface;
  @Input() index: number = 0;
  
  @Output() change = new EventEmitter<InputInterface>();
  @Output() blur = new EventEmitter<InputInterface>();

  constructor() {}

  ngOnInit(): void {}

  handleChange(event: any): void {
    const value = event.target.value;
    
    if (value?.length > 0) {
      this.inputData.hasError = false;
      this.inputData.errorMessage = '';
    }

    if (!this.inputData.noUpdate) {
      this.inputData.value = value;
      this.inputData.hasError = false;
      this.change.emit(this.inputData);
    } else {
      this.change.emit(this.inputData);
    }
  }

  handleBlur(event: any): void {
    const value = event.target.value;

    if (!this.inputData.noUpdate) {
      this.inputData.value = value;
      this.inputData.hasError = false;
      this.blur.emit(this.inputData);
    } else {
      this.blur.emit(this.inputData);
    }
  }

  getInputType(): string {
    return this.inputData.forceType || this.inputData.type || 'text';
  }

  getContainerClass(): string {
    const baseClass = `master-input ${this.inputData.extraComponent ? 'inp-icon' : ''}`;
    return baseClass;
  }
}
