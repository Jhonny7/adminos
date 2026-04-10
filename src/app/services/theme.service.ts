
import { Injectable } from '@angular/core';
import { LocalStorageEncryptService } from './local-storage-encrypt.service';
import { themeData } from '../../environments/environment.prod';

export const TIME_OUT = 1000 * 60 * 1; //ultimo número define en minutos
/**Clase provider que es básicamente un servicio generico para las peticiones a servicios */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private theme = themeData['black'];

  constructor(private storage: LocalStorageEncryptService) {
    this.loadTheme();
    this.applyTheme(); 
  }

  private loadTheme() {
    const key = this.storage.getFromLocalStorage("theme") || 'black';
    this.theme = themeData[key] || themeData['black'];
  }

  applyTheme() {
    const theme = this.theme;

    document.documentElement.style.setProperty('--border-color', theme.border);
    document.documentElement.style.setProperty('--color', theme.color);
    document.documentElement.style.setProperty('--background', theme.background);
  }

  get themeData() {
    return this.theme;
  }
  
}