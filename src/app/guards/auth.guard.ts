import { Injectable } from "@angular/core";
import { CanActivate, CanActivateChild, Router } from "@angular/router";
import { sessionTag } from "../../environments/environment.prod";

@Injectable(
    {
        providedIn: "root"
    }
)
export class AuthGuard implements CanActivate, CanActivateChild {

    constructor(
        private router: Router,
    ) {

    }

    canActivateChild() {
        return this.check();
    }

    canActivate() {
        return this.check();
    }

    check() {
        let userSessionEducacion: any = JSON.parse(localStorage.getItem(sessionTag));
        if (userSessionEducacion) {
            return true;
        } else {
            //console.log("aqui");
            this.router.navigate(["/login"]);
            return false;
        }
    }

}