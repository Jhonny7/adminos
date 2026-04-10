import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { InputInterface } from './input.types';

@Component({
  selector: 'app-oinput-phone',
  templateUrl: './input-phone.component.html',
  styleUrls: ['./input-phone.component.scss'],
  standalone: false
})
export class OInputPhoneComponent implements OnInit {
  @Input() inputData: InputInterface;
  @Input() index: number = 0;
  
  @Output() change = new EventEmitter<InputInterface>();
  @Output() blur = new EventEmitter<InputInterface>();

  constructor() {}

  ngOnInit(): void {}

  handleChange(event: any): void {
    const value = event.target.value;
    
    if (!this.inputData.noUpdate) {
      this.inputData.value = value;
      this.inputData.hasError = false;
      this.change.emit(this.inputData);
    } else {
      this.change.emit(this.inputData);
    }
  }

  handleBlur(event: any): void {
    if (!this.inputData.noUpdate) {
      this.inputData.value = event.target.value;
      this.inputData.hasError = false;
      this.blur.emit(this.inputData);
    } else {
      this.blur.emit(this.inputData);
    }
  }
}
