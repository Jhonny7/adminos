import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { LocalStorageEncryptService } from "./local-storage-encrypt.service";
import { UtilService } from "./util.service";
import { sessionTag } from "../../environments/environment.prod";

/**Clase provider que es básicamente un servicio generico para las peticiones a servicios */
@Injectable({
  providedIn: "root",
})
export class UserService {
  public user: any = null;

  constructor(
    private localStorageEncryptService: LocalStorageEncryptService,
    private utilService: UtilService,
    private translateService: TranslateService,
    private router: Router
  ) {
    this.user = this.localStorageEncryptService.getFromLocalStorage(sessionTag);
  }

  async updateLastSession(){
    if(this.user){
      //Actualizar last session en server
    }
  }
}
