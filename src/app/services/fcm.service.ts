import { Injectable } from "@angular/core";
import { sessionTag } from "./../../environments/environment.prod";
import { AlertService } from "./alert.service";
import { LoadingService } from "./loading-service";
import { LocalStorageEncryptService } from "./local-storage-encrypt.service";
import { Router } from "@angular/router";
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
} from "@capacitor/push-notifications";
import { HttpErrorResponse } from "@angular/common/http";
import { Device } from "@capacitor/device";

export interface FCMJson {
  to: string;
  notification: FCMNotification;
  data: FCMData;
  priority: string;
}

export interface FCMNotification {
  body: string;
  title: string;
  click_action: string;
  image: string;
  color: string;
  "content-available": boolean;
}

export interface FCMData {
  body: string;
  title: string;
  view: number;
  otherData?: any;
}
@Injectable({
  providedIn: "root",
})
export class FcmService {
  constructor(
    private router: Router,
    private loadingService: LoadingService,
    private localStorageEncryptService: LocalStorageEncryptService,
    private alertService: AlertService
  ) { }

  initPush() {
    ////console.log("init pushes");
    /* if (!emulado) {
      this.registerPush();
    } */
  }

  private async registerPush() {
    await PushNotifications.requestPermissions();

    await PushNotifications.register().then((t: any) => {
      ////console.log("register tokokok");
      ////console.log(t);
    });

    const uuid = await (await Device.getId()).identifier;

    PushNotifications.addListener("registration", (data) => {
      // alert(JSON.stringify(data));
      ////console.log("Disque register");

      ////console.log(data);

      let token: any =
        this.localStorageEncryptService.getFromLocalStorage("token-GymAdmon");
      if (!token) {
        let token: string = data.value;

        //Se registra correctamente nuevo usuario
        this.loadingService.hide();
        this.localStorageEncryptService.setToLocalStorage(
          "token-GymAdmon",
          token
        );

        this.registerToken(uuid, token);
        // FCM.subscribeTo({ topic: 'simsaAD' });//se suscribe a notificaciones globales de la app
      }
      //PushNotifications.
    });

    this.listenNotifications();

    // Get FCM token instead the APN one returned by Capacitor

    PushNotifications.addListener("registrationError", (error: any) => {
      ////console.log('Error: ' + JSON.stringify(error));
    });

    //this.listenNotifications();
  }

  public listenNotifications() {
    PushNotifications.addListener(
      "pushNotificationReceived",
      async (notification: PushNotificationSchema) => {
        ////console.log('Push received: ' + JSON.stringify(notification));
      }
    );

    PushNotifications.addListener(
      "pushNotificationReceived",
      (notification: PushNotificationSchema) => {
        ////console.log('notification ' + JSON.stringify(notification));
        ////console.log(notification);
        this.alertService.bottomModals(notification.title, notification.body);
      }
    );
    PushNotifications.requestPermissions().then((response) => {
      ////console.log(`reeeee`);
      ////console.log(response);

      PushNotifications.register().then((res: any) => {
        ////console.log(`registered for push`);
        ////console.log(res);
      });
    });

    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      async (notification: ActionPerformed) => {
        //console.log("PERFORMANCE----------------------");
        //console.log(notification);
        //console.log(notification.notification);
        //console.log(notification.notification.data);

        const data = notification.notification.data;
        //console.log(data);
        data.otherData = JSON.parse(data?.otherData);
        //console.log(data.otherData);

        switch (notification?.notification?.data?.view) {
          case 1:
            //hay que abrir la reunion que empieza
            // this.router.navigate(["meet", notification?.notification?.data?.otherData?.reunion]);
            break;

          default:
            break;
        }
        if (data.detailsId) {
          //this.router.navigateByUrl(`/home/${data.detailsId}`);
        }
      }
    );
  }

  public updateTokenUser() {
    let user: any = this.localStorageEncryptService.getFromLocalStorage(
      sessionTag
    );
    let token: any =
      this.localStorageEncryptService.getFromLocalStorage("token-GymAdmon");

    let tz: any = Intl.DateTimeFormat().resolvedOptions();
    console.log(token, tz);

    if (user) {
    }
  }

  registerToken(uuid: any, token: any) {
    let registerToken: any =
      this.localStorageEncryptService.getFromLocalStorage('token-GymAdmon');
    let lenguaje: any = this.localStorageEncryptService.getFromLocalStorage('language');
    if (!registerToken) {
      //token is token of device
      let uidFake: any = uuid;
      console.log(lenguaje, uidFake);
      //consultar uuid en base de datos antes de registrar nuevo token
      //Si encuentra el uuid se actualizará el token pero no creará nuevo usuario

    } else {
      //this.listenNotifications();
    }
  }
}
