import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, timeout } from 'rxjs/operators';
import { sessionTag } from '../../environments/environment';
import { LocalStorageEncryptService } from './local-storage-encrypt.service';

export const TIME_OUT = 1000 * 60 * 1; //ultimo número define en minutos

type SecureHttpOptions = {
    headers?: HttpHeaders | { [header: string]: string | string[] };
    params?: any;
};
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

    private buildSecureOptions(options: SecureHttpOptions = {}, isSecure: boolean = false): SecureHttpOptions {
        if (!isSecure) {
            return options;
        }

        const userSession = this.localStorageEncryptService.getFromSessionStorage(sessionTag)
            || this.localStorageEncryptService.getFromLocalStorage(sessionTag);
        const token = userSession?.token;

        if (!token) {
            return options;
        }

        const headers = options.headers instanceof HttpHeaders
            ? options.headers
            : new HttpHeaders(options.headers || {});

        return {
            ...options,
            headers: headers.set('Authorization', `Bearer ${token}`)
        };
    }

    /**Método que hace peticiones tipo GET */
    sendGetRequest<T = any>(webservice_URL: string, clase: any = null, isSecure: boolean = false) {
        let observable: any = this.http.get<T>(webservice_URL, this.buildSecureOptions({}, isSecure));

        if (clase) {
            return observable.pipe(map((data: any) => {
                let arr: any = data;

                let obj: any = null;
                if (!Array.isArray(arr)) {
                    obj = clase.fromJson(arr);
                } else {
                    obj = arr.map((item: any) => clase.fromJson(item));
                }
                return obj;
            }))
        } else {
            return observable;
        }
    }

    /**Método que hace peticiones tipo GET  con parámetros*/
    sendGetRequestParams<T = any>(webservice_URL: string, params: SecureHttpOptions = {}, isSecure: boolean = false) {
        //return this.http.get(webservice_URL, params).timeout(TIME_OUT);
        return this.http.get<T>(webservice_URL, this.buildSecureOptions(params, isSecure))
    }

    /**Método que hace peticiones tipo GET  con parámetros*/
    sendGetParams<T = any>(webservice_URL: string, params: any, isSecure: boolean = false) {
        //return this.http.get(webservice_URL, params).timeout(TIME_OUT);
        const options: SecureHttpOptions = { params };
        return this.http.get<T>(webservice_URL, this.buildSecureOptions(options, isSecure));
    }

    /**Método que hace peticiones tipo POST  con parámetros específicos*/
    sendPostRequestParams<T = any>(webservice_URL: string, params: any, httpOptions: SecureHttpOptions = {}, isSecure: boolean = false) {
        //return this.http.post(webservice_URL, params, httpOptions).timeout(TIME_OUT);
        return this.http.post<T>(webservice_URL, params, this.buildSecureOptions(httpOptions, isSecure));
    }

    /**Método que hace peticiones tipo POST */
    sendPostRequest<T = any>(webservice_URL: string, request: {} = {}, isSecure: boolean = false) {
        //return this.http.post(webservice_URL, request).timeout(TIME_OUT);
        return this.http.post<T>(webservice_URL, request, this.buildSecureOptions({}, isSecure)).pipe(timeout(TIME_OUT));
    }

    /**Método que hace peticiones tipo PUT */
    sendPutRequest<T = any>(webservice_URL: string, request: {} = {}, isSecure: boolean = false) {
        //return this.http.post(webservice_URL, request).timeout(TIME_OUT);
        return this.http.put<T>(webservice_URL, request, this.buildSecureOptions({}, isSecure));
    }

    /**Método que hace peticiones tipo DELETE */
    sendDeleteRequest<T = any>(webservice_URL: string, isSecure: boolean = false) {
        //return this.http.delete(webservice_URL).timeout(TIME_OUT);
        return this.http.delete<T>(webservice_URL, this.buildSecureOptions({}, isSecure));
    }

    /**Método que hace peticiones tipo DELETE */
    sendDelete<T = any>(webservice_URL: string, isSecure: boolean = false) {
        //return this.http.delete(webservice_URL).timeout(TIME_OUT);
        return this.http.delete<T>(webservice_URL, this.buildSecureOptions({}, isSecure));
    }

    getUser() {
        return this.localStorageEncryptService.getFromSessionStorage(sessionTag)
            || this.localStorageEncryptService.getFromLocalStorage(sessionTag);
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