import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { InputInterface } from './input.types';

@Component({
  selector: 'app-oinput-textarea',
  templateUrl: './input-textarea.component.html',
  styleUrls: ['./input-textarea.component.scss'],
  standalone: false
})
export class OInputTextareaComponent implements OnInit {
  @Input() inputData: InputInterface;
  @Input() index: number = 0;
  
  @Output() change = new EventEmitter<InputInterface>();
  @Output() blur = new EventEmitter<InputInterface>();

  constructor() {}

  ngOnInit(): void {}

  handleChange(event: any): void {
    const value = event.target.value;
    
    this.inputData.value = value;
    this.inputData.hasError = false;
    this.change.emit(this.inputData);
  }

  handleBlur(event: any): void {
    const value = event.target.value;
    
    this.inputData.value = value;
    this.inputData.hasError = false;
    this.blur.emit(this.inputData);
  }
}
