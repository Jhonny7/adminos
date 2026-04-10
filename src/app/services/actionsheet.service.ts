import { Injectable } from "@angular/core";

export interface ActionSheetButton {
  text: string;
  role?: 'cancel' | 'destructive';
  icon?: string;
  handler?: () => void;
}

@Injectable({ providedIn: 'root' })
export class ActionSheetService {

  open(buttons: ActionSheetButton[]) {
    const sheet = document.createElement('div');
    sheet.className = 'as-overlay';

    sheet.innerHTML = `
      <div class="as-backdrop"></div>
      <div class="as-container">
        ${buttons.map(btn => `
          <button class="as-btn ${btn.role ?? ''}">
            ${btn.text}
          </button>
        `).join('')}
      </div>
    `;

    document.body.appendChild(sheet);

    const btnElements = sheet.querySelectorAll('.as-btn');

    btnElements.forEach((el, i) => {
      el.addEventListener('click', () => {
        buttons[i].handler?.();
        document.body.removeChild(sheet);
      });
    });

    sheet.querySelector('.as-backdrop')?.addEventListener('click', () => {
      document.body.removeChild(sheet);
    });
  }
}