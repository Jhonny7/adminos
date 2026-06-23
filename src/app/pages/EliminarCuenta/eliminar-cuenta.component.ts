import { Component, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { paths } from '../../../environments/environment';
import { AlertService } from '../../services/alert.service';
import { GenericService } from '../../services/generic.service';
import { LoadingService } from '../../services/loading-service';
import { DeleteOtpModalComponent } from './delete-otp-modal.component';

@Component({
  selector: 'app-eliminar-cuenta',
  templateUrl: './eliminar-cuenta.component.html',
  styleUrls: ['./eliminar-cuenta.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class EliminarCuenta {
  showHelp = false;

  constructor(
    private alertService: AlertService,
    private genericService: GenericService,
    private loadingService: LoadingService,
    private dialog: MatDialog
  ) {}

  toggleHelp() {
    this.showHelp = !this.showHelp;
  }

  requestDelete() {
    this.alertService.alertWithInputs(
      (email: string) => {
        this.loadingService.show('Enviando código de verificación...');

        this.genericService.sendPostRequest(paths.deactivateOtp, { email }).subscribe({
          next: () => {
            this.loadingService.hide();
            this.dialog.open(DeleteOtpModalComponent, {
              data: { email },
              width: '420px',
              disableClose: true
            });
          },
          error: () => {
            this.loadingService.hide();
            this.alertService.errorAlert(
              'Error',
              'No pudimos enviar el código de verificación. Intenta de nuevo.'
            );
          }
        });
      },
      'Solicitar eliminación de cuenta',
      'Ingresa tu correo electrónico para recibir un código de verificación.',
      'Enviar código',
      'correo@ejemplo.com'
    );
  }
}
