import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { InputInterface } from './input.types';

@Component({
  selector: 'app-oinput-toggle',
  templateUrl: './input-toggle.component.html',
  styleUrls: ['./input-toggle.component.scss'],
  standalone: false
})
export class OInputToggleComponent implements OnInit, OnChanges {
  @Input() inputData: InputInterface;
  @Input() index: number = 0;
  
  @Output() change = new EventEmitter<InputInterface>();
  @Output() blur = new EventEmitter<InputInterface>();

  checked: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.checked = this.normalizeValue(this.inputData.value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['inputData'] && !changes['inputData'].firstChange) {
      this.checked = this.normalizeValue(this.inputData.value);
    }
  }

  normalizeValue(value: any): boolean {
    return value === true || value === 'true' || value === 1 || value === '1';
  }

  handleToggle(): void {
    if (this.inputData.disabled) return;
    
    const next = !this.checked;
    this.inputData.value = next;
    this.inputData.hasError = false;
    this.checked = next;
    this.change.emit(this.inputData);
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.handleToggle();
    }
  }

  handleBlur(): void {
    this.inputData.value = this.checked;
    this.inputData.hasError = false;
    this.blur.emit(this.inputData);
  }

  getToggleClass(): string {
    const baseClass = `toggle-chip ${this.checked ? 'checked' : 'unchecked'}`;
    return this.inputData.disabled ? `${baseClass} disabled` : baseClass;
  }
}
