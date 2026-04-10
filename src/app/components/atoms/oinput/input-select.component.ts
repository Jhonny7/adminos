import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { InputInterface } from './input.types';

@Component({
  selector: 'app-oinput-select',
  templateUrl: './input-select.component.html',
  styleUrls: ['./input-select.component.scss'],
  standalone: false
})
export class OInputSelectComponent implements OnInit, OnChanges {
  @Input() inputData: InputInterface;
  @Input() index: number = 0;
  
  @Output() change = new EventEmitter<InputInterface>();
  @Output() blur = new EventEmitter<InputInterface>();

  searchTerm: string = '';
  localValue: any = '';
  filteredValues: any[] = [];

  constructor() {}

  ngOnInit(): void {
    this.localValue = this.inputData.value || '';
    this.updateFilteredValues();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['inputData'] && !changes['inputData'].firstChange) {
      this.localValue = this.inputData.value || '';
      this.updateFilteredValues();
    }
  }

  updateFilteredValues(): void {
    const values = (this.inputData.values || []) as Array<{ value: any; label: string }>;
    
    if (!this.inputData.hasSearch || !this.searchTerm) {
      this.filteredValues = values;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredValues = values.filter(v => 
      (v.label?.toLowerCase().includes(term) || String(v.value)?.toLowerCase().includes(term))
    );
  }

  handleChange(event: any): void {
    const v = event.target.value;
    const values = (this.inputData.values || []) as Array<{ value: any; label: string }>;
    
    const matched = values.find(it => String(it.value) === v);
    const parsed = matched ? matched.value : v;

    if (!this.inputData.noUpdate) {
      this.inputData.value = parsed;
      this.inputData.hasError = false;
      this.localValue = parsed;
      this.change.emit(this.inputData);
    } else {
      this.change.emit(this.inputData);
    }
  }

  handleBlur(event: any): void {
    if (!this.inputData.noUpdate) {
      this.inputData.value = this.localValue;
      this.inputData.hasError = false;
      this.blur.emit(this.inputData);
    } else {
      this.blur.emit(this.inputData);
    }
  }

  handleSearchChange(event: any): void {
    this.searchTerm = event.target.value;
    this.updateFilteredValues();
  }

  toString(value: any): string {
    return String(value);
  }
}
