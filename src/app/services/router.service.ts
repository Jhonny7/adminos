
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LocalStorageEncryptService } from './local-storage-encrypt.service';

@Injectable({
  providedIn: 'root',
})
export class RouteInterceptorService {
  public _previousUrl: string;
  public _currentUrl: string;
  public _routeHistory: string[];

  constructor(
    router: Router,
    private localStorageEncryptService: LocalStorageEncryptService
  ) {
    console.log("service first");
    this._routeHistory = [];
    //let historyLocal: any = JSON.parse(localStorage.getItem('navigation'));
    let historyLocal: any = this.localStorageEncryptService.getFromLocalStorage('navigation');
    if (historyLocal) {
      this._routeHistory = historyLocal;
    }
    router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this._setURLs(event);
      });
  }

  private _setURLs(event: NavigationEnd): void {
    console.log("_setURL");

    const tempUrl = this._currentUrl;
    this._previousUrl =
      this._routeHistory.length > 0
        ? this._routeHistory[this._routeHistory.length - 1]
        : tempUrl;
    this._currentUrl = event.urlAfterRedirects;
    if (
      event.urlAfterRedirects !=
      this._routeHistory[this._routeHistory.length - 1]
    ) {
      this._routeHistory.push(event.urlAfterRedirects);
    }
    //localStorage.setItem('navigation', JSON.stringify(this._routeHistory));
    this.localStorageEncryptService.setToLocalStorage("navigation", this._routeHistory);
  }

  get previousUrl(): string {
    return this._previousUrl;
  }

  set previousUrl(url: string) {
    this._previousUrl = url;
  }

  get currentUrl(): string {
    return this._currentUrl;
  }

  get routeHistory(): string[] {
    return this._routeHistory;
  }
}
