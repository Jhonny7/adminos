import { Component, Input, Output, EventEmitter } from '@angular/core';
import { InputInterface } from './input.types';

@Component({
  selector: 'app-oinput-otp',
  template: `<div class="otp-placeholder">OTP Input - Placeholder</div>`,
  standalone: false
})
export class OInputOTPComponent {
  @Input() inputData: InputInterface;
  @Input() index: number = 0;
  @Output() change = new EventEmitter<InputInterface>();
  @Output() blur = new EventEmitter<InputInterface>();
}

@Component({
  selector: 'app-oinput-special-select',
  template: `<div class="special-select-placeholder">Special Select - Placeholder</div>`,
  standalone: false
})
export class OInputSpecialSelectComponent {
  @Input() inputData: InputInterface;
  @Input() index: number = 0;
  @Output() change = new EventEmitter<InputInterface>();
  @Output() blur = new EventEmitter<InputInterface>();
}

@Component({
  selector: 'app-oinput-map',
  template: `<div class="map-placeholder">Map Input - Placeholder</div>`,
  standalone: false
})
export class OInputMapComponent {
  @Input() inputData: InputInterface;
  @Input() index: number = 0;
  @Output() change = new EventEmitter<InputInterface>();
  @Output() blur = new EventEmitter<InputInterface>();
}

@Component({
  selector: 'app-oinput-dragdrop',
  template: `<div class="dragdrop-placeholder">Drag & Drop Input - Placeholder</div>`,
  standalone: false
})
export class OInputDragDropComponent {
  @Input() inputData: InputInterface;
  @Input() index: number = 0;
  @Output() change = new EventEmitter<InputInterface>();
  @Output() blur = new EventEmitter<InputInterface>();
}

@Component({
  selector: 'app-oinput-autocomplete',
  template: `<div class="autocomplete-placeholder">Autocomplete Input - Placeholder</div>`,
  standalone: false
})
export class OInputAutocompleteComponent {
  @Input() inputData: InputInterface;
  @Input() index: number = 0;
  @Output() change = new EventEmitter<InputInterface>();
  @Output() blur = new EventEmitter<InputInterface>();
}
