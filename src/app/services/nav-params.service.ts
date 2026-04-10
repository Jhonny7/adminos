import { LocalStorageEncryptService } from './local-storage-encrypt.service';
import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Injectable({
    providedIn: "root"
})
export class NavParamsService {
    private params: any = {};
    private key: string = "params";
    constructor(
        private router: Router,
        private routes: ActivatedRoute,
        private localStorageEncryptService: LocalStorageEncryptService) {

    }

    public push(routerLink: string, p: any = null) {
        /**
         * Format params (Toma en cuenta que no se debe repetir el nombre de propiedad o se sobreescribirá)
         * params = {propertyName: "propiedad" , value: "valor", etc: "etc"};
         */

        if (p) {
            let result = Object.keys(p).map(function (key) {
                return [(key), p[key]];
            });

            result.forEach(element => {
                this.params[element[0]] = JSON.stringify(element[1]);//se envían parámetros al objeto general
            });

            ////console.log(this.params);


        }
        this.localStorageEncryptService.setToLocalStorage(this.key, this.params);
        this.router.navigate([routerLink]);
    }

    public get(key: string) {
        this.params = this.localStorageEncryptService.getFromLocalStorage(this.key);
        let objs: any = Object;
        let valor: any = objs.values(this.params)[Object.keys(this.params).indexOf(key)];
        if (valor) {
            return JSON.parse(valor);
        } else {
            return null;
        }
    }
}