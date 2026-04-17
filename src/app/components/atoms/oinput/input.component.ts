import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { InputInterface } from './input.types';

@Component({
  selector: 'oinput, app-oinput',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  standalone: false
})
export class OInputComponent implements OnInit, OnChanges {
  @Input() inputData: InputInterface;
  @Input() index: number = 0;
  @Input() extraClass: string = '';
  @Input() globalExtraClass: string = '';

  // Legacy compatibility API
  @Input() inputPlaceholder: string = '';
  @Input() inputLabel: string = '';
  @Input() inputType: string = 'text';

  private _olamModel: any = '';

  @Input()
  set olamModel(value: any) {
    this._olamModel = value;
    if (this.inputData) {
      this.inputData.value = value;
    }
  }

  get olamModel(): any {
    return this._olamModel;
  }
  
  @Output() change = new EventEmitter<{ data: InputInterface; index: number }>();
  @Output() blur = new EventEmitter<{ data: InputInterface; index: number }>();
  @Output() olamModelChange = new EventEmitter<any>();

  currentType: string;

  constructor() {}

  ngOnInit(): void {
    this.syncInputData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.syncInputData();
  }

  private syncInputData(): void {
    const resolvedType = this.inputType || this.inputData?.forceType || this.inputData?.type || 'text';

    if (!this.inputData) {
      this.inputData = {
        value: this._olamModel ?? '',
        type: resolvedType,
        forceType: resolvedType,
        placeholder: this.inputPlaceholder || '',
        label: this.inputLabel || '',
        hasTopLabel: !!this.inputLabel,
        globalExtraClass: this.globalExtraClass || '',
        extraClass: this.extraClass || '',
        hasEye: false,
      };
    } else {
      this.inputData.value = this._olamModel ?? this.inputData.value;
      this.inputData.placeholder = this.inputData.placeholder || this.inputPlaceholder || '';
      this.inputData.label = this.inputData.label || this.inputLabel || '';
      this.inputData.hasTopLabel = this.inputData.hasTopLabel ?? !!(this.inputData.label || this.inputLabel);
      this.inputData.globalExtraClass = this.inputData.globalExtraClass || this.globalExtraClass || '';
      this.inputData.extraClass = this.inputData.extraClass || this.extraClass || '';
      this.inputData.type = this.inputData.type || resolvedType;
      this.inputData.forceType = this.inputType || this.inputData.forceType || this.inputData.type;
    }

    this.currentType = this.inputData?.forceType || this.inputData?.type || 'text';
  }

  onInputChange(data: InputInterface): void {
    this._olamModel = data?.value;
    this.olamModelChange.emit(data?.value);
    this.change.emit({ data, index: this.index });
  }

  onInputBlur(data: InputInterface): void {
    this._olamModel = data?.value;
    this.olamModelChange.emit(data?.value);
    this.blur.emit({ data, index: this.index });
  }

  getComponentClass(): string {
    const baseClass = `${this.globalExtraClass} ${this.extraClass} ${this.inputData?.globalExtraClass || ''} gp-form`;
    return this.inputData?.type === 'between' ? `${baseClass} between-dates` : baseClass;
  }
}
