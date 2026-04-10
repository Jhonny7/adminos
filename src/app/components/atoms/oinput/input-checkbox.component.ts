import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { InputInterface, CheckboxOption } from './input.types';

@Component({
  selector: 'app-oinput-checkbox',
  templateUrl: './input-checkbox.component.html',
  styleUrls: ['./input-checkbox.component.scss'],
  standalone: false
})
export class OInputCheckboxComponent implements OnInit {
  @Input() inputData: InputInterface;
  @Input() index: number = 0;
  
  @Output() change = new EventEmitter<InputInterface>();
  @Output() blur = new EventEmitter<InputInterface>();

  constructor() {}

  ngOnInit(): void {}

  handleChange(value: string): void {
    const mode = (this.inputData as any).checkboxMode || 'toggle';
    
    const currentValues: string[] = Array.isArray(this.inputData.value)
      ? this.inputData.value
      : this.inputData.value
        ? [String(this.inputData.value)]
        : [];

    let updatedValues: string[] = [];

    if (mode === 'toggle') {
      if (currentValues.some(v => String(v) === String(value))) {
        updatedValues = currentValues.filter(v => String(v) !== String(value));
      } else {
        updatedValues = [...currentValues, value];
      }
    } else {
      updatedValues = currentValues.includes(value) ? [] : [...currentValues, value];
    }

    const finalValue = updatedValues.length > 0 ? updatedValues[0] : '';

    this.inputData.value = finalValue;
    this.inputData.hasError = false;
    this.change.emit(this.inputData);
  }

  handleBlur(): void {
    if (!this.inputData.noUpdate) {
      this.inputData.hasError = false;
      this.blur.emit(this.inputData);
    } else {
      this.blur.emit(this.inputData);
    }
  }

  isChecked(optionValue: string): boolean {
    const currentValues: string[] = Array.isArray(this.inputData.value)
      ? this.inputData.value
      : this.inputData.value
        ? [String(this.inputData.value)]
        : [];
    return currentValues.some(v => String(v) === String(optionValue));
  }

  getCheckboxClass(isChecked: boolean): string {
    const mode = (this.inputData as any).checkboxMode || 'toggle';
    let classes = 'circle';
    if (isChecked) {
      classes += ' checkd';
    }
    if (mode === 'toggle') {
      classes += ' squartle';
    }
    return classes;
  }
}
