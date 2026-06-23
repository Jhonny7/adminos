import { CommonModule } from "@angular/common";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { OButtonComponent } from "./components/atoms/obutton/obutton";
import {
  OInputAutocompleteComponent,
  OInputCheckboxComponent,
  OInputComponent,
  OInputDateComponent,
  OInputDragDropComponent,
  OInputMapComponent,
  OInputOTPComponent,
  OInputPasswordComponent,
  OInputPhoneComponent,
  OInputSelectComponent,
  OInputSpecialSelectComponent,
  OInputTextareaComponent,
  OInputTextComponent,
  OInputToggleComponent
} from "./components/atoms/oinput";
import { OInputExampleComponent } from "./components/atoms/oinput/oinput-example.component";
import { SpinnerComponent } from "./components/atoms/spinner/spinner.component";
import { OModalAlertComponent } from "./components/molecules/modal-alert/modal-alert";
import { OContainerComponent } from "./components/molecules/ocontainer/ocontainer";
import { SidebarComponent } from "./components/molecules/sidebar/sidebar";
import { SpinnerOverlayComponent } from "./components/molecules/spinner-overlay/spinner-overlay.component";
import { LayoutComponent } from "./components/organisms/layout/layout";
import { OTableComponent, OTableExampleComponent } from "./components/organisms/otable";
import { MaterialModule } from "./material.module";
import { Home } from "./pages/Home/home.component";
import { Login } from "./pages/login/login.component";
import { Dashboard } from "./pages/Dashboard/dashboard.component";
import { Labors } from "./pages/Labors/labors.component";
import { Plaguicidas } from "./pages/Plaguicidas/plaguicidas.component";
import { Predios } from "./pages/Predios/predios.component";
import { OSquareButtonComponent } from "./components/atoms/osquare-button/osquare-button.component";
import { CodeInputComponent } from "./components/atoms/code-input/code-input.component";
import { OIconComponent } from "./components/atoms/oicon/oicon.component";
import { ModalPanelContainerComponent } from "./components/atoms/modal-panel/modal-panel.component";
import { PopoverContainerComponent } from "./components/atoms/popover/popover.component";
import { BaseChartDirective } from 'ng2-charts';
import { ReturnsCosts } from "./pages/ReturnsCosts/returns-costs.component";
import { EliminarCuenta } from "./pages/EliminarCuenta/eliminar-cuenta.component";
import { DeleteOtpModalComponent } from "./pages/EliminarCuenta/delete-otp-modal.component";

export const exporters: any = [
  LayoutComponent,
  SidebarComponent,
  OButtonComponent,
  OModalAlertComponent,
  OContainerComponent,
  SpinnerOverlayComponent,
  SpinnerComponent,
  OTableComponent,
  OTableExampleComponent,
  OSquareButtonComponent,
  OIconComponent,
  // Main
  OInputComponent,
  
  // Basic inputs
  OInputTextComponent,
  OInputPasswordComponent,
  OInputTextareaComponent,
  OInputSelectComponent,
  OInputPhoneComponent,
  OInputDateComponent,
  
  // Toggle & Checkbox
  OInputToggleComponent,
  OInputCheckboxComponent,
  
  // Code Input (OTP)
  CodeInputComponent,

  // Advanced (placeholders)
  OInputOTPComponent,
  OInputSpecialSelectComponent,
  OInputMapComponent,
  OInputDragDropComponent,
  OInputAutocompleteComponent,
  //Pages
  Login,
  Home,
  Dashboard,
  Labors,
  ReturnsCosts,
  Plaguicidas,
  Predios,
  EliminarCuenta,
  DeleteOtpModalComponent,
  OInputExampleComponent,
  ModalPanelContainerComponent,
  PopoverContainerComponent
];

@NgModule({
  declarations: [
    ...exporters
  ],
  exports: [
    ...exporters,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    MaterialModule,
    BaseChartDirective
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class ComponentsModule {}