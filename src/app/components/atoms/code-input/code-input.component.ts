import { Component, Input, Output, EventEmitter, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'code-input',
  templateUrl: './code-input.component.html',
  styleUrls: ['./code-input.component.scss'],
  standalone: false
})
export class CodeInputComponent implements AfterViewInit {
  @Input() isCodeHidden: boolean = false;
  @Input() codeLength: number = 6;
  @Output() codeCompleted = new EventEmitter<string>();

  @ViewChildren('inputBox') inputBoxes!: QueryList<ElementRef<HTMLInputElement>>;

  digits: string[] = [];

  ngAfterViewInit() {
    this.digits = new Array(this.codeLength).fill('');
    setTimeout(() => this.focusBox(0));
  }

  onInput(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '');
    if (value) {
      this.digits[index] = value[value.length - 1];
      if (index < this.codeLength - 1) {
        this.focusBox(index + 1);
      } else {
        this.emitCode();
      }
    }
    input.value = this.digits[index];
  }

  onKeydown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace') {
      if (this.digits[index]) {
        this.digits[index] = '';
      } else if (index > 0) {
        this.focusBox(index - 1);
      }
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text').replace(/\D/g, '') || '';
    for (let i = 0; i < this.codeLength && i < pasted.length; i++) {
      this.digits[i] = pasted[i];
      const box = this.inputBoxes?.get(i);
      if (box) {
        box.nativeElement.value = pasted[i];
      }
    }
    const nextIndex = Math.min(pasted.length, this.codeLength);
    if (nextIndex < this.codeLength) {
      this.focusBox(nextIndex);
    } else {
      this.emitCode();
    }
  }

  private focusBox(index: number) {
    const box = this.inputBoxes?.get(index);
    box?.nativeElement.focus();
  }

  private emitCode() {
    const code = this.digits.join('');
    if (code.length === this.codeLength) {
      this.codeCompleted.emit(code);
    }
  }
}
