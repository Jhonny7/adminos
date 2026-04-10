import { ComponentFactoryResolver, Injectable, OnDestroy } from "@angular/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { TranslateService } from "@ngx-translate/core";
import { AdComponent } from "../interfaces/ad.interface";
import { AdDirective } from "./../directives/ad.directive";
import { AlertService } from "./alert.service";
import { LoadingService } from "./loading-service";

export function getFileReader(): FileReader {
  const fileReader = new FileReader();
  const zoneOriginalInstance = (fileReader as any)[
    "__zone_symbol__originalInstance"
  ];
  return zoneOriginalInstance || fileReader;
}

export interface IButtonSheet {
  text: string;
  icon?: string;
  handler: Function;
}
/**Clase provider que se utiliza para generar mensajes de error, alerta o éxito
 * Se hizo de forma genérica para evitar repetir esta clase de código
 */
@Injectable({
  providedIn: "root",
})
export class UtilService implements OnDestroy {
  public width: number = 0;
  /**Constructor del servicio en el que se inyecta el controlador de alertas de ionic
   * y eventos de escucha para el momento de un cierre de sesión inesperado
   */
  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private loadingService: LoadingService,
    private translateService: TranslateService,
    private alertService: AlertService
  ) {}

  getRandomText(length) {
    var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".match(/./g);
    var text = "";
    for (var i = 0; i < length; i++)
      text += charset[Math.floor(Math.random() * charset.length)];
    return text;
  }

  ngOnDestroy(): void {
    throw new Error("Method not implemented.");
  }

  renderDynamicComponent(component: any, host: AdDirective, data: any = null) {
    const componentFactory: any =
      this.componentFactoryResolver.resolveComponentFactory(component);

    const viewContainerRef = host.viewContainerRef;

    viewContainerRef.clear();

    const componentRef: any =
      viewContainerRef.createComponent<AdComponent>(componentFactory);

    componentRef.instance.data = data;
  }

  toBase64(file) {
    return new Promise((resolve, reject) => {
      //const reader = new FileReader();
      let reader = getFileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  hexToRgbA(hex, transparentPercentage) {
    if (transparentPercentage > 100 || transparentPercentage < 0) {
      transparentPercentage = 1;
    }
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split("");
      if (c.length == 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = "0x" + c.join("");
      return (
        "rgba(" +
        [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",") +
        `,${transparentPercentage / 100})`
      );
    }
    throw new Error("Bad Hex");
  }

  randomHexadecimal() {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return "#" + randomColor;
  }

  compress(
    file: any,
    returnBase64: boolean = true,
    factor: number = 5
  ): Promise<any> {
    //console.log(file);
    file = file.target ? file.target.files[0] : file;
    const width = 500;
    const height = 500;
    const fileName = file.name;

    //const reader = new FileReader();
    let reader = getFileReader();
    reader.readAsDataURL(file);
    return new Promise((resolve, reject) => {
      //console.log('1');

      (reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        //console.log('2');
        (img.onload = () => {
          let widthi = 0;
          let heighti = 0;
          if (file.size > 1000000) {
            widthi = img.width / factor;
            heighti = img.height / factor;
          } else {
            widthi = img.width;
            heighti = img.height;
          }
          //console.log('5');
          const elem = document.createElement("canvas");
          elem.width = widthi;
          elem.height = heighti;
          const ctx = elem.getContext("2d");
          //ctx.globalAlpha = 0.2;
          // img.width and img.height will contain the original dimensions
          ctx.drawImage(img, 0, 0, widthi, heighti);
          //console.log('6');
          ctx.canvas.toBlob(
            async (blob) => {
              //console.log('7');
              let filet: any = new File([blob], fileName, {
                type: "image/png",
                lastModified: Date.now(),
              });
              //console.log('8');
              let resultado = await this.getBase64(file);
              resolve(returnBase64 ? resultado : filet);
              //Logica de nuevo file
            },
            "image/png",
            1
          );
        }),
          (img.onerror = (error: any) => {
            //console.log('4');
            reject(error);
          });
      }),
        (reader.onerror = (error: any) => {
          //console.log('3');
          //console.log(error);

          reject(error);
        });
    });
  }

  convertVideoToBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  }

  compressB64(b64, factor) {
    return new Promise((resolve, reject) => {
      //console.log('1');

      const img = new Image();
      img.src = b64;
      //console.log('2');
      (img.onload = () => {
        let widthi = 0;
        let heighti = 0;
        widthi = img.width / factor;
        heighti = img.height / factor;
        //console.log(widthi, heighti);

        //console.log('5');
        const elem = document.createElement("canvas");
        elem.width = widthi;
        elem.height = heighti;
        const ctx = elem.getContext("2d");
        //ctx.globalAlpha = 0.2;
        // img.width and img.height will contain the original dimensions
        ctx.drawImage(img, 0, 0, widthi, heighti);
        //console.log('6');
        ctx.canvas.toBlob(
          async (blob) => {
            //console.log('7');
            let filet: any = new File([blob], "compress", {
              type: "image/png",
              lastModified: Date.now(),
            });
            //console.log('8');
            let resultado = await this.getBase64(filet);
            resolve(resultado);
            //Logica de nuevo file
          },
          "image/png",
          1
        );
      }),
        (img.onerror = (error: any) => {
          //console.log(error);

          //console.log('4');
          reject(error);
        });
    });
  }

  urltoFile(url, filename, mimeType) {
    var arr = url.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mimeType });
  }

  getBase64(file): Promise<any> {
    // const reader = new FileReader();
    let reader = getFileReader();
    reader.readAsDataURL(file);
    //console.log('9');
    return new Promise((resolve, reject) => {
      reader.onload = () => {
        //console.log('10');
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        //console.log('11');
        reject(error);
      };
    });
  }

  onlyText(event: any) {
    var numregex = /[^a-z0-9 .]/gi;
    if (numregex.test(event.target.value)) {
      event.target.value = event.target.value.replace(numregex, "");
    }
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  }

  replaceAll(str, find, replace) {
    return str.replace(new RegExp(this.escapeRegExp(find), "g"), replace);
  }

  sortArrayByParam(array: Array<any>, param: string) {
    array.sort((a: any, b: any) => {
      return a[param].localeCompare(b[param]);
    });
    return array;
  }

  filterArrayByParam(
    array: Array<any>,
    param: string,
    word: string,
    param2: string = ""
  ) {
    let users = array,
      result = [];
    result = users.filter((user) => {
      return param2.length > 0
        ? user[param].toLowerCase().search(word.toLowerCase()) != -1 ||
            user[param2].toLowerCase().search(word.toLowerCase()) != -1
        : user[param].toLowerCase().search(word.toLowerCase()) != -1;
    });
    return result;
  }

  checkColorDark(color) {
    const hex = color.replace("#", "");
    const c_r = parseInt(hex.substring(0, 0 + 2), 16);
    const c_g = parseInt(hex.substring(2, 2 + 2), 16);
    const c_b = parseInt(hex.substring(4, 4 + 2), 16);
    const brightness = (c_r * 299 + c_g * 587 + c_b * 114) / 1000;
    return brightness > 155;
  }

  onlyNumberKey(evt) {
    // Only ASCII character in that range allowed
    var ASCIICode = evt.which ? evt.which : evt.keyCode;
    if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57)) return false;
    return true;
  }

  isOnlyNumbers(obj) {
    let r = false;
    const regx = /^\d*$/g;

    if (regx.test(obj)) {
      r = true;
    }

    return r;
  }

  validateCURP(curp) {
    var re =
        /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0\d|1[0-2])(?:[0-2]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/,
      validado = curp.match(re);

    if (!validado)
      //Coincide con el formato general?
      return false;

    //Validar que coincida el dígito verificador
    function digitoVerificador(curp17) {
      //Fuente https://consultas.curp.gob.mx/CurpSP/
      var diccionario = "0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ",
        lngSuma = 0.0,
        lngDigito = 0.0;
      for (var i = 0; i < 17; i++)
        lngSuma = lngSuma + diccionario.indexOf(curp17.charAt(i)) * (18 - i);
      lngDigito = 10 - (lngSuma % 10);
      if (lngDigito == 10) return 0;
      return lngDigito;
    }
    if (validado[2] != digitoVerificador(validado[1])) return false;

    return true; //Validado
  }

  validateRFC(rfc) {
    let regex: RegExp =
      /^[A-Z&Ñ]{3,4}[0-9]{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{2}[0-9A]$/g;
    return regex.test(rfc);
  }

  addLeadingZeros(str, targetLength) {
    return str?.padStart(targetLength, "0");
  }

  padTo2Digits(num) {
    return num.toString().padStart(2, "0");
  }

  formatDate(date) {
    return [
      this.padTo2Digits(date.getDate()),
      this.padTo2Digits(date.getMonth() + 1),
      date.getFullYear(),
    ].join("_");
  }

  async getBase64ImageFromUrl(url: string) {
    //var proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
      //const reader = new FileReader();
      let reader = getFileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        resolve(base64data);
      };
    });
  }

  getBase64ImageFromUrl2(url, outputFormat: string = "image/jpeg") {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = function () {
        let canvas = <HTMLCanvasElement>document.createElement("CANVAS"),
          ctx = canvas.getContext("2d"),
          dataURL;
        let self: any = this.onload;
        canvas.height = self.height;
        canvas.width = self.width;
        ctx.drawImage(self, 0, 0);
        dataURL = canvas.toDataURL(outputFormat);
        //callback(dataURL);
        canvas = null;
        resolve(dataURL);
      };

      img.src = url;
    });
  }

  capitalizeFirsLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  shuffle(array) {
    //ordena aleatoriamente un array
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }

  ///////////////////////////////ONLY PRESENTATION
  public applyStyles(element, styles, dimensiones: any = null): void {
    let carta: any = document.getElementById("carta");

    let dimensions = { ...dimensiones };

    dimensions.height = dimensions.height - 100;
    dimensions.width = dimensions.width - 88;

    //console.log(dimensions);
    if (element.nodeName == "P") {
      element.style.padding = "0";
      element.style.margin = "0";
    }
    let titulos: any = Object.keys(styles);
    //this.addImg(this.data.logo.img, true, false);
    titulos.forEach((estilo) => {
      try {
        if (estilo == "top") {
          //console.log("top original ",Number(styles[estilo].split('px')[0]));
          //console.log("dimension original ",dimensions.height);
          //console.log("valor porcentual ",(100 / dimensions.height));
          //console.log("total aplicado ",((100 / dimensions.height) *
          // Number(styles[estilo].split('px')[0])));

          let percentageValue =
            dimensions.height /
            ((100 / dimensions.height) * Number(styles[estilo].split("px")[0]));
          styles[estilo] = `${
            carta.offsetHeight - carta.offsetHeight * (percentageValue / 100)
          }px`;
        }
        /*

        if (estilo == 'left') {
         //console.log(dimensions.width);
          let percentageValue =
            dimensions.width /
            ((100 / dimensions.width) *
              Number(styles[estilo].split('px')[0]));
         //console.log(percentageValue);
          styles[estilo] = `${dimensions.width - (dimensions.width * (percentageValue / 100))}px`;
         // styles[estilo] = `${percentageValue}%`;
        } */

        element.style[String(estilo)] = String(styles[estilo]);
      } catch (error) {}
    });
  }

  public getStylesComplete(styles): void {
    let titulos: any = Object.keys(styles);
    let estilosReal: any = {};
    //this.addImg(this.data.logo.img, true, false);
    titulos.forEach((estilo) => {
      //element.style.setProperty(estilo, styles[estilo]);
      //element.style['backgroundColor'] = 'blue'

      try {
        if (styles[estilo] && String(styles[estilo]).length > 0) {
          estilosReal[String(estilo)] = String(styles[estilo]);
        }
        //console.log(estilosReal);
      } catch (error) {}
    });
    return estilosReal;
  }

  public calculateStorageSize(): number {
    var _lsTotal = 0,
      _xLen,
      _x;
    for (_x in localStorage) {
      if (!localStorage.hasOwnProperty(_x)) {
        continue;
      }
      _xLen = (localStorage[_x].length + _x.length) * 2;
      _lsTotal += _xLen;
    }

    let storageSize = _lsTotal / 1024;
    return storageSize;
  }

  public addMilliseconds(milliseconds, isSeconds: boolean = false) {
    let result = Date.now();
    result = result + milliseconds * (isSeconds ? 1000 : 1);
    return result;
  }

  public millisToDate(milliseconds) {
    return new Date(milliseconds);
  }

  async createFileFromUrl(url, name) {
    let fileName = name;
    let response = await fetch(url);
    let data = await response.blob();
    let metadata = {
      type: url.includes(".pdf")
        ? "application/pdf"
        : url.includes(".png")
        ? "image/png"
        : url.includes(".jpg")
        ? "image/jpg"
        : "image/gif",
    };
    let file = new File(
      [data],
      `${fileName ?? new Date().getTime()}${
        url.includes(".pdf")
          ? ".pdf"
          : url.includes(".png")
          ? ".png"
          : url.includes(".jpg")
          ? ".jpg"
          : ".gif"
      }`,
      metadata
    );
    return file;
  }

  addCommaToThousand(x: any) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  clickForFile(id: any) {
    let input = document.createElement("input");
    input.type = "file";
    document.body.appendChild(input);
  }

  async changeFileCommon(evt) {
    if (
      evt.target.files[0].type != "image/jpeg" &&
      evt.target.files[0].type != "image/jpg" &&
      evt.target.files[0].type != "image/png"
    ) {
      this.alertService.bottomModals(
        this.translateService.instant("alerts.wait"),
        this.translateService.instant("alerts.file")
      );
    } else {
      //let componente: any = this;
      this.loadingService.show(this.translateService.instant("PROCESSING"));

      let logoTmp = await this.compress(evt);
      this.loadingService.hide();
    }
  }

  openFile(
    acceptedFiles = ["image/jpeg", "image/jpg", "image/png"],
    wannaB64: boolean = true
  ) {
    this.loadingService.show();
    return new Promise((resolve, reject) => {
      var input = document.createElement("input");
      input.type = "file";
      input.style.visibility = "hidden";
      input.style.position = "absolute";
      input.className = "hidden-input"; // set the CSS class
      document.body.appendChild(input); // put it into the DOM
      input.click();

      input.addEventListener("change", async (e: any) => {
        let file = e.target.files[0];

        let filteredType: any = acceptedFiles.filter(
          (af: any) => af == file.type
        );
        if (!filteredType || filteredType.length <= 0) {
          this.alertService.bottomModals(
            this.translateService.instant("alerts.wait"),
            this.translateService.instant("alerts.file")
          );
        }

        if (file) {
          this.loadingService.hide();
          if (!this.isVideoFile(file)) {
            console.log("like image");

            resolve(await this.compress(e));
          } else {
            resolve(wannaB64 ? await this.convertVideoToBase64(file) : file);
          }
        } else {
          this.loadingService.hide();
          reject(new Error("No se seleccionó ningún archivo."));
        }
        document.body.removeChild(input);
      });
    });
  }

  isVideoFile(file: File): boolean {
    // Verifica la extensión del archivo o el tipo MIME para determinar si es un video
    const allowedExtensions = ["mp4", "mov", "avi", "mkv"]; // Puedes agregar más extensiones según tus necesidades

    // Verifica la extensión
    const fileNameParts = file.name.split(".");
    const fileExtension = fileNameParts[fileNameParts.length - 1].toLowerCase();
    if (allowedExtensions.includes(fileExtension)) {
      return true;
    }

    // Verifica el tipo MIME
    const allowedMimeTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska",
    ];
    if (allowedMimeTypes.includes(file.type)) {
      return true;
    }

    return false;
  }

  async takeFoto(isCamera: boolean = true, isMultiple: boolean = false) {
    const image = await Camera.getPhoto({
      quality: 40,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      saveToGallery: true,
      source: isCamera ? CameraSource.Camera : CameraSource.Photos,
    });
    let base64Image: string = "data:image/jpeg;base64," + image.base64String;
    return this.gotPhoto(base64Image, isMultiple);
  }

  gotPhoto(imageUri, isMultiple: boolean = false) {
    return new Promise((resolve, reject) => {
      try {
        (<any>window).resolveLocalFileSystemURL(imageUri, (fileEntry) => {
          fileEntry.file((fileObj) => {
            setTimeout(async () => {
              let img: any = await this.compress(fileObj);
              resolve(img);
            }, 1000);
          });
        });
      } catch (error) {
        reject(null);
      }
    });
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

export const formatCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});
