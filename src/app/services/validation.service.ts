import { Injectable } from '@angular/core';

@Injectable({
  providedIn: "root"
})
export class ValidationService {

  constructor() {}

  public getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
    const config: any = {
      required: "Campo requerido",
      invalidCreditCard: 'Número de tarjeta inválido',
      invalidEmailAddress: 'Correo electrónico inválido',
      invalidPassword: 'Contraseña inválida. La contraseña debe contener mínimo 8 caracteres, por lo menos un valor numérico y mínimo un símbolo.',
      minlength: `Mínimum longitud ${validatorValue?.requiredLength}`,
      maxlength: `Maxima longitud ${validatorValue?.requiredLength}`,
      seleccion: 'El campo es requerido, selecciona al menos uno',
      invalidNumber: 'Ingrese un número válido',
      phone: 'Ingrese un número válido',
      maxilength: `Longitud máxima 10 dígitos`,
      minilength: `Longitud mínima 10 dígitos`,
      minilengthpass: `Longitud mínima requerida 6 caracteres`,
      maxilengthpass: `Longitud máxima requerida 10 caracteres`,
      onlyCharacter: `El campo es de tipo texto`,
    };

    return config[validatorName];
  }

  static creditCardValidator(control: any) {
    if (!control?.value) return null;

    const regex = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/;
    return regex.test(control.value) ? null : { invalidCreditCard: true };
  }

  static emailValidator(control: any) {
    if (!control?.value) return null;

    const regex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    return regex.test(control.value) ? null : { invalidEmailAddress: true };
  }

  static characterValidator(control: any) {
    if (!control?.value) return null;

    const regex = /^[ a-zA-ZÀ-ÿ\u00f1\u00d1]*$/;

    if (regex.test(control._pendingValue)) {
      return null;
    }

    const cleaned = control._pendingValue.slice(0, -1);

    if (regex.test(cleaned)) {
      control.setValue(cleaned);
    }

    return null;
  }

  static phoneValidator(control: any) {
    if (!control?.value) return null;

    const regex = /^[0-9]*$/;

    if (regex.test(control._pendingValue)) {
      return null;
    }

    const cleaned = control._pendingValue.slice(0, -1);

    if (regex.test(cleaned)) {
      control.setValue(cleaned);
    }

    return null;
  }

  static passwordValidator(control: any) {
    if (!control?.value) return null;

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
    return regex.test(control.value) ? null : { invalidPassword: true };
  }

  static maxLengthValidator(control: any) {
    if (!control?.value) return null;

    if (control._pendingValue.length <= 10) return null;

    control.setValue(control._pendingValue.slice(0, -1));
    return null;
  }

  static maxLengthCCV(control: any) {
    if (!control?.value) return null;

    if (control._pendingValue.length <= 3) return null;

    control.setValue(control._pendingValue.slice(0, -1));
    return null;
  }

  static maxLengthCard(control: any) {
    if (!control?.value) return null;

    if (control._pendingValue.length <= 20) return null;

    control.setValue(control._pendingValue.slice(0, -1));
    return null;
  }

  static minLengthValidator(control: any) {
    if (!control?.value) return null;

    return control._pendingValue.length >= 10
      ? null
      : { minilength: true };
  }

  static minLengthPassValidator(control: any) {
    if (!control?.value) return null;

    return control._pendingValue.length >= 6
      ? null
      : { minilengthpass: true };
  }

  static maxLengthPassValidator(control: any) {
    if (!control?.value) return null;

    return control.value.length > 10
      ? { maxilengthpass: true }
      : null;
  }

  static numberValidator(control: any) {
    if (!control?.value) return null;

    const regex = /^[0-9]*$/;
    return regex.test(control.value)
      ? null
      : { invalidNumber: true };
  }
}