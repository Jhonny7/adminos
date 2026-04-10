import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { InputInterface } from './input.types';

@Component({
  selector: 'app-oinput-date',
  templateUrl: './input-date.component.html',
  styleUrls: ['./input-date.component.scss'],
  standalone: false
})
export class OInputDateComponent implements OnInit {
  @Input() inputData: InputInterface;
  @Input() index: number = 0;
  
  @Output() change = new EventEmitter<InputInterface>();
  @Output() blur = new EventEmitter<InputInterface>();

  lastValue: string = '';

  constructor() {}

  ngOnInit(): void {
    this.lastValue = this.inputData.value || '';
  }

  formatDateToDDMMYYYY(value: string): string {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return value;
  }

  handleChange(event: any): void {
    let rawValue = event.target.value;
    rawValue = this.formatDateToDDMMYYYY(rawValue);
    
    if (rawValue.length > 0) {
      event.target.blur();
    }
  }

  handleBlur(event: any): void {
    let rawValue = event.target.value;
    
    if (!rawValue || rawValue.length <= 0) {
      rawValue = this.lastValue;
    } else {
      this.lastValue = event.target.value;
    }
    
    rawValue = this.formatDateToDDMMYYYY(rawValue);
    
    if (!this.inputData.noUpdate) {
      this.inputData.value = rawValue;
      this.inputData.extraValue = event.target.value;
      this.inputData.hasError = false;
      this.blur.emit(this.inputData);
    } else {
      this.inputData.value = rawValue;
      this.blur.emit(this.inputData);
    }
  }

  handleDateInputFocus(event: any): void {
    event.target.type = 'date';
    event.target.showPicker?.();
  }

  handleDateInputBlur(event: any): void {
    event.target.type = 'text';
  }
}
