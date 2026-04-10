import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, timeout } from 'rxjs/operators';
import { LocalStorageEncryptService } from './local-storage-encrypt.service';

export const TIME_OUT = 1000 * 60 * 1; //ultimo número define en minutos
/**Clase provider que es básicamente un servicio generico para las peticiones a servicios */
@Injectable(
    {
        providedIn: "root"
    }
)
export class GenericService {

    public user: any = null;
    constructor(
        private http: HttpClient,
        private localStorageEncryptService: LocalStorageEncryptService) {
    }

    /**Método que hace peticiones tipo GET */
    sendGetRequest(webservice_URL: string, clase: any = null) {
        let observable: any = this.http.get(webservice_URL);

        if (clase) {
            return observable.pipe(map((data: any) => {
                let arr: any = data;

                let obj: any = null;
                if (!Array.isArray(arr)) {
                    obj = clase.fromJson(arr);
                } else {
                    obj = arr.map(item => clase.fromJson(item));
                }
                return obj;
            }))
        } else {
            return observable;
        }
    }

    /**Método que hace peticiones tipo GET  con parámetros*/
    sendGetRequestParams(webservice_URL: string, params: any) {
        //return this.http.get(webservice_URL, params).timeout(TIME_OUT);
        return this.http.get(webservice_URL, params)
    }

    /**Método que hace peticiones tipo GET  con parámetros*/
    sendGetParams(webservice_URL: string, params: any) {
        //return this.http.get(webservice_URL, params).timeout(TIME_OUT);
        let options: any = {};
        options.params = params;
        return this.http.get(webservice_URL, options);
    }

    /**Método que hace peticiones tipo POST  con parámetros específicos*/
    sendPostRequestParams(webservice_URL: string, params: any, httpOptions: any) {
        //return this.http.post(webservice_URL, params, httpOptions).timeout(TIME_OUT);
        return this.http.post(webservice_URL, params, httpOptions);
    }

    /**Método que hace peticiones tipo POST */
    sendPostRequest(webservice_URL: string, request: { }) {
        //return this.http.post(webservice_URL, request).timeout(TIME_OUT);
        return this.http.post(webservice_URL, request).pipe(timeout(TIME_OUT));
    }

    /**Método que hace peticiones tipo PUT */
    sendPutRequest(webservice_URL: string, request: {} = {}) {
        //return this.http.post(webservice_URL, request).timeout(TIME_OUT);
        return this.http.put(webservice_URL, request);
    }

    /**Método que hace peticiones tipo DELETE */
    sendDeleteRequest(webservice_URL: string) {
        //return this.http.delete(webservice_URL).timeout(TIME_OUT);
        return this.http.delete(webservice_URL);
    }

    /**Método que hace peticiones tipo DELETE */
    sendDelete(webservice_URL: string) {
        //return this.http.delete(webservice_URL).timeout(TIME_OUT);
        return this.http.delete(webservice_URL);
    }

    getUser() {
        return this.localStorageEncryptService.getFromLocalStorage("userSession");
    }

    //For themes
    getColorPrimary() {
        let color: any = this.localStorageEncryptService.getFromLocalStorage("primary");
       //console.log(color);
        
        return color;
    }

    getColorHex() {
        let color: any = this.localStorageEncryptService.getFromLocalStorage("theme");

        //#031024 nuevo color del tema
        //console.log(color);
        if(color == "#FFFFFF"){
            color = "#006480";
        }

        return color;
    }

    getColorFont() {
        let color: any = this.localStorageEncryptService.getFromLocalStorage("color-font");

        return color;
    }

    getColorClass() {
        let color: any = this.localStorageEncryptService.getFromLocalStorage("theme");
        let retornar: any = color == '#3b64c0' ? 'alerta-loteria' : color == '#be3b3b' ? 'alerta-loteria2' : color == '#3bb8be' ? 'alerta-loteria3' : color == '#292929' ? 'alerta-loteria5' : color == '#71cef5' ? 'alerta-loteria6' : 'alerta-loteria4';

        return retornar;
    }

    getColorClassTWO() {
        let color: any = this.localStorageEncryptService.getFromLocalStorage("theme");
        let retornar: any = color == '#3b64c0' ? 'alerta-two-button' : color == '#be3b3b' ? 'alerta-two-button2' : color == '#3bb8be' ? 'alerta-two-button3' : color == '#292929' ? 'alerta-two-button5' : color == '#71cef5' ? 'alerta-two-button6' : 'alerta-two-button4';

        return retornar;
    }
}