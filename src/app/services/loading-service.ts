import { Injectable } from '@angular/core';
import { OverlayRef, Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { SpinnerOverlayComponent } from '../components/molecules/spinner-overlay/spinner-overlay.component';

@Injectable(
  {
    providedIn: "root"
  }
)
export class LoadingService {
  private overlayRef: OverlayRef = null;
  private activo: boolean = false;

  constructor(private overlay: Overlay) { }
  //
  public show(message = '') {
    // Returns an OverlayRef (which is a PortalHost)
    //console.log("showing");

    if (!this.activo) {
      this.activo = !this.activo;
      if (!this.overlayRef) {
        this.overlayRef = this.overlay.create();
      }

      // Create ComponentPortal that can be attached to a PortalHost
      const spinnerOverlayPortal = new ComponentPortal(SpinnerOverlayComponent);
      const component = this.overlayRef.attach(spinnerOverlayPortal); // Attach ComponentPortal to PortalHost
      component.instance.message = message;
      //console.log(message);
    }
  }

  public hide() {
   ////console.log("hide");
    
    if (this.activo) {
     ////console.log("si estaba activo");
      
      this.activo = false;
      if (!!this.overlayRef) {
        this.overlayRef.detach();
      }
    }
  }
}