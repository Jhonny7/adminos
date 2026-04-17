import { Component, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: false
})
export class App {
  protected readonly title = signal('admin');

  constructor(
    private translate: TranslateService,
  ) {
    this.translate.setDefaultLang('es');
    this.translate.use('es');
  }
}
