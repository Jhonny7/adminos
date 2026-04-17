import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { paths, sessionTag } from '../../../environments/environment';
import { AlertService } from '../../services/alert.service';
import { GenericService } from '../../services/generic.service';
import { LoadingService } from '../../services/loading-service';
import { LocalStorageEncryptService } from '../../services/local-storage-encrypt.service';
import { ThemeService } from '../../services/theme.service';

interface LoginResponse {
  token: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class Login implements OnInit, OnDestroy {
  public load = false;
  public type = true;
  public sus?: Subscription;
  public user: LoginResponse | null = null;

  public dataLogin = {
    access: '',
    password: '',
  };

  constructor(
    private alertService: AlertService,
    private loadingService: LoadingService,
    public router: Router,
    private localStorageEncryptService: LocalStorageEncryptService,
    public themeService: ThemeService,
    private genericService: GenericService,
  ) {
    this.user = this.localStorageEncryptService.getFromLocalStorage(sessionTag);
  }

  ngOnInit() {
    if (this.user) {
      this.router.navigate(['/', 'admin']);
      return;
    }

    setTimeout(() => {
      this.load = false;
    }, 1800);
  }

  login() {
    const access = this.dataLogin.access?.trim();
    const password = this.dataLogin.password?.trim();

    if (!access || !password) {
      this.alertService.warnAlert(
        'Campos requeridos',
        'Ingresa tu usuario y contraseña para continuar.'
      );
      return;
    }

    const body = {
      access,
      password,
      device: this.getDeviceInfo(),
    };

    this.loadingService.show('Iniciando sesión...');
    this.sus?.unsubscribe();
    this.sus = this.genericService.sendPostRequest<LoginResponse>(paths.login, body).subscribe(
      (response: LoginResponse) => {
        this.loadingService.hide();
        this.user = response;
        this.localStorageEncryptService.setToSessionStorage(sessionTag, response);
        this.router.navigate(['/', 'admin']);
      }, (error: HttpErrorResponse) => {
        this.loadingService.hide();
        const message =
          error?.error?.message ||
          error?.error?.error ||
          error?.message ||
          'No fue posible iniciar sesión.';

        this.alertService.errorAlert('Error de acceso', message);
      },
    );
  }

  ngOnDestroy(): void {
    this.sus?.unsubscribe();
  }

  eye() {
    this.type = !this.type;
  }

  forgot() {
  }

  register() {
    console.log('go to register');
    this.router.navigate(['/', 'choose']);
  }

  private getDeviceInfo(): string {
    if (typeof navigator === 'undefined') {
      return 'browser';
    }

    const userAgent = navigator.userAgent || '';
    const platform = navigator.platform || 'browser';
    let browser = 'Browser';

    if (userAgent.includes('Edg')) {
      browser = 'Edge';
    } else if (userAgent.includes('OPR') || userAgent.includes('Opera')) {
      browser = 'Opera';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Safari';
    } else if (userAgent.includes('Chrome')) {
      browser = 'Chrome';
    }

    return `${browser} - ${platform}`;
  }
}
