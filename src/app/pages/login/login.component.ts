import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AlertService } from '../../services/alert.service';
import { LoadingService } from '../../services/loading-service';
//import firebase from 'firebase'
import { LocalStorageEncryptService } from '../../services/local-storage-encrypt.service';
import { ThemeService } from '../../services/theme.service';
import { GenericService } from '../../services/generic.service';
import { FcmService } from '../../services/fcm.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class Login implements OnInit, OnDestroy {
  slideOpts = {
    initialSlide: 1,
    speed: 400,
  };

  public load: boolean = false;

  public opciones: any = [];
  public user: any = null;

  public opcionesUsuario: any = [];

  public cards: any = [];

  public sus?: Subscription;

  public dataLogin: any = {
    username: '',
    password: '',
  };

  public data: any = {
    email: {
      error: false,
      value: '',
    },
    username: {
      error: false,
      value: '',
    },
    pass: {
      error: false,
      value: '',
    },
    confirm: {
      error: false,
      value: '',
    },
  };

  public enterMail: string = '';

  public type: boolean = true;

  constructor(
    private alertService: AlertService,
    private loadingService: LoadingService,
    public router: Router,
    private localStorageEncryptService: LocalStorageEncryptService,
    public themeService: ThemeService,
    private translateService: TranslateService,
    private genericService: GenericService,
    private fcmService: FcmService
  ) {
    this.user =
      this.localStorageEncryptService.getFromLocalStorage('userSessionGymAdmon');
  }

  ngOnInit() {
    if (this.user) {
      this.router.navigate(['/', 'posco', 'administration']);
    }
    setTimeout(() => {
      this.load = false;
    }, 1800);
  }

  login() {
    this.loadingService.show();
  }

  ngOnDestroy(): void {}

  eye() {
    this.type = !this.type;
  }

  forgot() {
    
  }

  sendMail(otpNumber, emailTo, username) {
    
  }

  register() {
    console.log("go to register");
    this.router.navigate(['/', 'choose']);
  }
}
