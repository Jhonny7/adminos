
//import { TranslateService } from '@ngx-translate/core';
import { Injectable, HostListener, ApplicationRef, Injector, ComponentRef, ViewContainerRef, ComponentFactoryResolver, EmbeddedViewRef } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatBottomSheet, MatBottomSheetRef } from "@angular/material/bottom-sheet";
import { MatMenuTrigger } from "@angular/material/menu";
import swal, { SweetAlertOptions } from "sweetalert2";
import { PlatformLocation } from "@angular/common";
import { TranslateService } from "@ngx-translate/core";
import { ThemeService } from "./theme.service";
import { ActionSheetContainerComponent } from "../components/atoms/action-sheet/action-sheet.component";
import { ModalPanelContainerComponent } from "../components/atoms/modal-panel/modal-panel.component";
import { PopoverContainerComponent } from "../components/atoms/popover/popover.component";

export interface IButtonSheet {
  text: string;
  icon?: string;
  handler: Function;
}

@Injectable({
  providedIn: "root",
})
export class AlertService {
  constructor(
    private location: PlatformLocation,
    private translateService: TranslateService,
    public themeService: ThemeService,
    private appRef: ApplicationRef,
    private injector: Injector,
    private dialog: MatDialog,
    private bottomSheet: MatBottomSheet,
  ) {
    location.onPopState(() => {
      swal.close();
    });
  }

  customizeAlert(data: any, accion: any = null, cancelAction: any = null) {
    swal.fire(data).then((result) => {
      //console.log(result);

      if (result.isConfirmed) {
        if (accion) {
          accion();
        }
      } else {
        if (cancelAction) {
          cancelAction();
        }
      }
    });
  }

  warnAlert(titulo: string, mensaje: string, accion: any = null) {
    let dataAlert: any = {
      type: null,
      title: null,
      text: null,
      confirmButtonText: "Aceptar",
      showCancelButton: false,
      showCloseButton: true,
      allowOutsideClick: false,
      customClass: "alerta-vista-warn",
    };

    dataAlert.html = `
          
          <div class="contenedor-imagen warn-a"> 
          </div>
    
          <div class="mensaje">
            <p>${titulo}</p>
          </div>
    
          <div class="descripcion">
            <p>${mensaje}</p>
          </div>
          `;
    dataAlert.funcion = () => {};

    swal.fire(dataAlert).then((result) => {
      if (result.value) {
        if (accion) {
          accion();
        }
      }
    });
  }

  errorAlert(titulo: string, mensaje: string, accion: any = null) {
    let dataAlert: any = {
      type: null,
      title: null,
      text: null,
      confirmButtonText: "Aceptar",
      showCancelButton: false,
      showCloseButton: true,
      allowOutsideClick: false,
      customClass: "alerta-vista-error",
    };

    dataAlert.html = `
          
          <div class="contenedor-imagen error-a"> 
          </div>
    
          <div class="mensaje">
            <p>${titulo}</p>
          </div>
    
          <div class="descripcion">
            <p>${mensaje}</p>
          </div>
          `;
    dataAlert.funcion = () => {};

    swal.fire(dataAlert).then((result) => {
      if (result.value) {
        if (accion) {
          accion();
        }
      }
    });
  }

  bottomModals(
    titulo: string,
    mensaje: string,
    accion: any = null,
    cssClass: string = "olam-alert",
    hasComment: boolean = false,
    showDenyButton: boolean = true,
    denyButtonText:string= `No`
  ) {
    let dataAlert: any = {
      type: null,
      title: null,
      text: null,
      confirmButtonText: this.translateService.instant("alerts.accept"),
      showCancelButton: false,
      showCloseButton: true,
      showDenyButton: showDenyButton,
      denyButtonText:denyButtonText,
      allowOutsideClick: true,
      customClass: `${cssClass} ${
        this.themeService.themeData?.alert_class || ''
      }`,
      showClass: {
        popup: "animated bounceInUp",
      },
      hideClass: {
        popup: "animated bounceOutDown",
      },
    };

    dataAlert.html = `
          
          <div class="contenedor-imagen success-a"> 
          </div>
    
          <div class="mensaje">
            <p>${titulo}</p>
          </div>
    
          <div class="descripcion">
            <p>${mensaje}</p>
          </div>
          `;

    if (hasComment) {
      dataAlert.html += `<div class="descripcion">
            <textarea cols="30"
            rows="3" id="commentVal" style="width: 100%;
            margin-top: 20px;
            background: #cacaca;
            outline: none;
            border: none;
            border-radius: 4px;" placeholder="Comentarios..."> </textarea>
          </div>`;
    }

    dataAlert.funcion = () => {};

    swal.fire(dataAlert).then((result) => {
      if (result.value) {
        if (accion) {
          accion();
        }
      }
    });
  }

  bottomModalsActions(
    titulo: string,
    mensaje: string,
    accion: any = null,
    cssClass: string = "olam-alert",
    accionDenied: any = null
  ) {
    let dataAlert: any = {
      type: null,
      title: null,
      text: null,
      confirmButtonText: this.translateService.instant("alerts.accept"),
      showCancelButton: false,
      showDenyButton: true,
      showCloseButton: true,
      allowOutsideClick: true,
      customClass: `${cssClass} ${
       this.themeService.themeData?.alert_class || ''
      }`,
      showClass: {
        popup: "animated bounceInUp",
      },
      hideClass: {
        popup: "animated bounceOutDown",
      },
    };

    dataAlert.html = `
          
          <div class="contenedor-imagen success-a"> 
          </div>
    
          <div class="mensaje">
            <p>${titulo}</p>
          </div>
    
          <div class="descripcion">
            <p>${mensaje}</p>
          </div>
          `;
    dataAlert.funcion = () => {};

    swal.fire(dataAlert).then((result) => {
      if (result.isConfirmed) {
        if (accion) {
          accion();
        }
      } else if (result.isDenied) {
        if (accionDenied) {
          accionDenied();
        }
      }
    });
  }

  successAlert(
    titulo: string,
    mensaje: string,
    accion: any = null,
    cssClass: string = "olam-alert"
  ) {
    let dataAlert: any = {
      type: null,
      title: null,
      text: null,
      confirmButtonText: this.translateService.instant("alerts.accept"),
      showCancelButton: false,
      showCloseButton: true,
      allowOutsideClick: true,
      customClass: `${cssClass} ${
       this.themeService.themeData?.alert_class || ''
      }`,
      showClass: {
        popup: "animated bounceInUp",
      },
      hideClass: {
        popup: "animated bounceOutDown",
      },
    };

    dataAlert.html = `
          
          <div class="contenedor-imagen success-a"> 
          </div>
    
          <div class="mensaje">
            <p>${titulo}</p>
          </div>
    
          <div class="descripcion">
            <p>${mensaje}</p>
          </div>
          `;
    dataAlert.funcion = () => {};

    swal.fire(dataAlert).then((result) => {
      if (result.value) {
        if (accion) {
          accion();
        }
      }
    });
  }

  confirmWithButtons(
    titulo: string,
    accion: any = null,
    accionCancel: any = null,
    cssClass: string = "olam-alert"
  ) {
    let dataAlert: any = {
      type: null,
      title: null,
      text: null,
      confirmButtonText: this.translateService.instant("alerts.accept"),
      showCancelButton: false,
      showCloseButton: true,
      allowOutsideClick: true,
      customClass: `${cssClass} ${
        this.themeService.themeData?.alert_class || ''
      }`,
      showClass: {
        popup: "animated bounceInUp",
      },
      hideClass: {
        popup: "animated bounceOutDown",
      },
    };

    dataAlert.html = `
          <div class="mensaje">
            <p>${titulo}</p>
          </div>
          `;
    dataAlert.funcion = () => {};

    swal.fire(dataAlert).then((result) => {
      if (result.value) {
        if (accion) {
          accion();
        }
      }
    });
  }

  confirmTrashAlert(
    accion: any = null,
    titulo: string = "",
    mensaje: string = "",
    buttonTitle: string = "",
    cssClass: string = "alerta-vista"
  ) {
    let dataAlert: any = {
      type: null,
      title: null,
      text: null,
      confirmButtonText: buttonTitle,
      showCancelButton: true,
      showCloseButton: true,
      allowOutsideClick: false,
      customClass: `${cssClass} trash`,
    };

    dataAlert.html = `
          
          <div class="contenedor-imagen trash-a"> 
          </div>
    
          <div class="mensaje">
            <p>${titulo}</p>
          </div>
    
          <div class="descripcion">
            <p>${mensaje}</p>
          </div>
          `;
    dataAlert.funcion = () => {};

    swal.fire(dataAlert).then((result) => {
      if (result.value) {
        if (accion) {
          accion();
        }
      }
    });
  }

  alertWithInputs(
    accion: any = null,
    titulo: string = "",
    mensaje: string = "",
    confirmButtonText: string = "Aceptar",
    placeholder: string = "Email"
  ) {
    let dataAlert: any = {
      type: null,
      title: null,
      text: null,
      confirmButtonText: confirmButtonText,
      showCancelButton: false,
      showCloseButton: true,
      allowOutsideClick: false,
      customClass: "alerta-vista-warn",
    };

    dataAlert.html = `
          
          <div class="contenedor-imagen warn-a"> 
          </div>
    
          <div class="mensaje">
            <p>${titulo}</p>
          </div>
    
          <div class="descripcion">
            <p>${mensaje}</p>
          </div>

          <div>
            <input type="text" id="em" placeholder="${placeholder}"/>
          </div>
          `;
    dataAlert.funcion = () => {};
    dataAlert.preConfirm = () => {
      let valor: any = document.getElementById("em");
      if (valor.value.length <= 0) {
        valor.style.border = "1px solid #ec0000";
        return false;
      } else {
        valor.style.border = "1px solid #cacaca";

        const re =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let isEmail = re.test(String(valor.value).toLowerCase());
        if (isEmail) {
          valor.style.border = "1px solid #cacaca";
          return true;
        } else {
          valor.style.border = "1px solid #ec0000";
          return false;
        }
      }
    };
    swal.fire(dataAlert).then((result) => {
      let valor: any = document.getElementById("em");
      if (result.value) {
        if (accion) {
          accion(valor.value);
        }
      }
    });
  }

  custom(html: string, didRender: any) {
    let dataAlert: any = {
      type: null,
      title: null,
      text: null,
      showCancelButton: false,
      showCloseButton: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      customClass: "alerta-vista",
    };

    dataAlert.html = html;
    dataAlert.funcion = () => {};
    dataAlert.didRender = didRender;

    return swal.fire(dataAlert);
  }

  @HostListener("window:popstate", ["$event"])
  onPopState(event) {
    ////console.log("back?");

    swal.close();
  }

  // =============================================
  // MATERIAL MODAL METHODS (ActionSheet, Panel, Popover)
  // =============================================

  /**
   * Opens an iOS-style action sheet from the bottom with swipe gesture support
   * @param buttons Array of button configs with text, icon, and handler
   * @param title Optional header title
   * @param hasCancelButton Show cancel button (default: true)
   */
  openActionSheet(
    buttons: IButtonSheet[],
    title: string = '',
    hasCancelButton: boolean = true
  ): Promise<any> {
    const bottomSheetRef = this.bottomSheet.open(ActionSheetContainerComponent, {
      data: {
        buttons,
        title,
        hasCancelButton
      },
      panelClass: 'action-sheet-bottom-panel',
      disableClose: false,
      hasBackdrop: true,
    });

    return bottomSheetRef.afterDismissed().toPromise().then((result: any) => {
      return result || null;
    });
  }

  /**
   * Opens a modal-style panel with custom component or HTML with swipe effect
   * @param component Component to render OR HTML string
   * @param title Header title
   * @param position Position: 'bottom', 'right', 'left', 'top'
   * @param data Data to pass to component
   */
  openPanel(
    component: any,
    title: string = '',
    position: 'bottom' | 'right' | 'left' | 'top' = 'bottom',
    data: any = null
  ): Promise<any> {
    const isHTML = typeof component === 'string';

    const dialogRef = this.dialog.open(ModalPanelContainerComponent, {
      data: {
        component,
        isHTML,
        title,
        position,
        componentData: data
      },
      panelClass: `modal-panel-${position}`,
      disableClose: false,
      hasBackdrop: true,
      width: position === 'right' || position === 'left' ? '400px' : '100%',
      height: position === 'bottom' || position === 'top' ? 'auto' : '100%',
    });

    return dialogRef.afterClosed().toPromise().then((result) => {
      return result || null;
    });
  }

  /**
   * Opens a popover with custom component or buttons
   * @param component Component to render OR array of buttons
   * @param title Header title
   * @param trigger MatMenuTrigger reference or event (for positioning)
   * @param data Data to pass to component
   */
  openPopover(
    component: any,
    title: string = '',
    trigger?: any,
    data: any = null
  ): Promise<any> {
    const isComponent = typeof component !== 'object' || !Array.isArray(component);
    const isButtons = Array.isArray(component);

    const dialogRef = this.dialog.open(PopoverContainerComponent, {
      data: {
        component: isComponent ? component : null,
        buttons: isButtons ? component : null,
        isComponent,
        title,
        componentData: data
      },
      panelClass: 'popover-panel',
      disableClose: false,
      hasBackdrop: true,
      width: 'auto',
      height: 'auto',
      position: this.getPopoverPosition(trigger)
    });

    return dialogRef.afterClosed().toPromise().then((result) => {
      return result || null;
    });
  }

  private getPopoverPosition(trigger?: any): any {
    if (!trigger) return {};

    let left: number;
    let top: number;

    // If trigger is MouseEvent, position near the mouse
    if (trigger instanceof MouseEvent) {
      left = trigger.clientX;
      top = trigger.clientY;
    } else if (trigger && trigger.menuTrigger) {
      // If trigger is MatMenuTrigger, position relative to element
      const element = trigger.menuTrigger._elementRef.nativeElement;
      const rect = element.getBoundingClientRect();
      left = rect.left;
      top = rect.top + rect.height;
    } else {
      return {};
    }

    // Assume popover size (can be adjusted)
    const popoverWidth = 300;
    const popoverHeight = 200;

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust horizontal position
    if (left + popoverWidth > viewportWidth) {
      left = viewportWidth - popoverWidth - 10; // 10px margin
    }
    if (left < 10) {
      left = 10;
    }

    // Adjust vertical position - prefer below, but flip if not enough space
    if (top + popoverHeight > viewportHeight) {
      // Not enough space below, try above
      const aboveTop = top - popoverHeight - 10;
      if (aboveTop > 10) {
        top = aboveTop;
      } else {
        // Not enough space above either, position at top with margin
        top = 10;
      }
    }

    return {
      left: left + 'px',
      top: top + 'px'
    };
  }
}

