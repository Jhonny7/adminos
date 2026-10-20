import { ChangeDetectorRef, Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { paths } from '../../../environments/environment';
import { GenericService } from '../../services/generic.service';
import { AlertService } from '../../services/alert.service';
import { LoadingService } from '../../services/loading-service';
import { LocalStorageEncryptService } from '../../services/local-storage-encrypt.service';

@Component({
  selector: 'app-delete-otp-modal',
  templateUrl: './delete-otp-modal.component.html',
  styleUrls: ['./delete-otp-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class DeleteOtpModalComponent {
  errorMessage = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { email: string },
    private dialogRef: MatDialogRef<DeleteOtpModalComponent>,
    private genericService: GenericService,
    private alertService: AlertService,
    private loadingService: LoadingService,
    private localStorageEncryptService: LocalStorageEncryptService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onCodeCompleted(code: string) {
    this.errorMessage = '';
    this.loadingService.show('Verificando código...');

    this.genericService.sendPostRequest(paths.deactivateConfirm, {
      email: this.data.email,
      code
    }).subscribe({
      next: () => {
        this.loadingService.hide();
        this.dialogRef.close();

        this.localStorageEncryptService.clear();

        this.alertService.successAlert(
          'Cuenta eliminada',
          'Tu cuenta de BioParcela ha sido eliminada correctamente.',
          () => {
            this.router.navigate(['/login']);
          }
        );
      },
      error: () => {
        this.loadingService.hide();
        this.errorMessage = 'El código ingresado no es válido o ha expirado. Intenta de nuevo.';
        this.cdr.detectChanges();
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
