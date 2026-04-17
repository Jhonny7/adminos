import { Injectable } from "@angular/core";
import { CanActivate, CanActivateChild, Router } from "@angular/router";
import { sessionTag } from "../../environments/environment";
import { LocalStorageEncryptService } from "../services/local-storage-encrypt.service";

@Injectable(
    {
        providedIn: "root"
    }
)
export class AuthGuard implements CanActivate, CanActivateChild {

    constructor(
        private router: Router,
        private localStorageEncryptService: LocalStorageEncryptService,
    ) {

    }

    canActivateChild() {
        return this.check();
    }

    canActivate() {
        return this.check();
    }

    check() {
        let userSessionEducacion: any = this.localStorageEncryptService.getFromSessionStorage(sessionTag) || this.localStorageEncryptService.getFromLocalStorage(sessionTag);
        if (userSessionEducacion) {
            return true;
        } else {
            //console.log("aqui");
            this.router.navigate(["/login"]);
            return false;
        }
    }

}