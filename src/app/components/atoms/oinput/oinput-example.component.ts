import { Component } from '@angular/core';
import { InputInterface } from './input.types';

/**
 * EJEMPLO DE USO DEL COMPONENTE OINPUT EN ANGULAR
 * 
 * Este es un ejemplo completo de cómo usar todos los tipos de inputs
 * en un formulario real.
 */

@Component({
  selector: 'app-oinput-example',
  templateUrl: './oinput-example.component.html',
  styleUrls: ['./oinput-example.component.scss'],
  standalone: false
})
export class OInputExampleComponent {
  
  // ============================================
  // DECLARACIÓN DE INPUTS
  // ============================================

  // Text Input
  nameInput: InputInterface = {
    value: '',
    type: 'text',
    placeholder: 'Enter your full name',
    label: 'Full Name',
    hasTopLabel: true,
    required: true,
    maxLength: 100,
    hasError: false,
    errorMessage: 'Name is required'
  };

  // Email Input
  emailInput: InputInterface = {
    value: '',
    type: 'text',
    placeholder: 'your@email.com',
    label: 'Email',
    hasTopLabel: true,
    required: true,
    hasError: false,
    errorMessage: 'Invalid email'
  };

  // Password Input
  passwordInput: InputInterface = {
    value: '',
    type: 'password',
    placeholder: 'Enter password',
    label: 'Password',
    hasTopLabel: true,
    required: true,
    hasEye: true,
    hasError: false,
    errorMessage: 'Password is required'
  };

  // Select Input
  countryInput: InputInterface = {
    value: '',
    type: 'select',
    placeholder: 'Select a country',
    label: 'Country',
    hasTopLabel: true,
    hasSearch: true,
    values: [
      { value: 'us', label: 'United States' },
      { value: 'mx', label: 'Mexico' },
      { value: 'es', label: 'Spain' },
      { value: 'ar', label: 'Argentina' }
    ],
    hasError: false,
    errorMessage: 'Country is required'
  };

  // Textarea Input
  bioInput: InputInterface = {
    value: '',
    type: 'textarea',
    placeholder: 'Tell us about yourself',
    label: 'Bio',
    hasTopLabel: true,
    rows: 4,
    cols: 50,
    maxLength: 500,
    hasError: false,
    errorMessage: 'Bio is too long'
  };

  // Toggle Input
  notificationsInput: InputInterface = {
    value: false,
    type: 'toggle',
    label: 'Enable email notifications',
    hasTopLabel: true
  };

  // Checkbox Input (Multiple)
  interestsInput: InputInterface = {
    value: '',
    type: 'checkbox',
    label: 'Select your interests',
    hasTopLabel: true,
    values: [
      { value: 'sports', label: 'Sports' },
      { value: 'music', label: 'Music' },
      { value: 'travel', label: 'Travel' },
      { value: 'cooking', label: 'Cooking' }
    ],
    checkboxMode: 'toggle'
  };

  // Date Input
  birthdayInput: InputInterface = {
    value: '',
    type: 'date',
    placeholder: 'Select your birthday',
    label: 'Birthday',
    hasTopLabel: true,
    hasError: false,
    errorMessage: 'Invalid date'
  };

  // Phone Input
  phoneInput: InputInterface = {
    value: '',
    type: 'phone',
    placeholder: '+1 (555) 000-0000',
    label: 'Phone Number',
    hasTopLabel: true,
    maxLength: 20
  };

  // Price Input
  priceInput: InputInterface = {
    value: '',
    type: 'price',
    placeholder: '0.00',
    label: 'Price',
    hasTopLabel: true,
    maxLength: 10
  };

  // ============================================
  // HANDLERS
  // ============================================

  onInputChange(event: any): void {
    const { data, index } = event;
    console.log(`Input ${index} cambió:`, data.value);
    
    // Aquí puedes hacer validaciones dinámicas
    this.validateInput(data);
  }

  onInputBlur(event: any): void {
    const { data, index } = event;
    console.log(`Input ${index} perdió el foco:`, data.value);
    
    // Validar cuando pierde el foco
    this.validateInput(data);
  }

  validateInput(input: InputInterface): void {
    // Reset error
    input.hasError = false;
    input.errorMessage = '';

    // Validaciones específicas
    if (input.required && !input.value) {
      input.hasError = true;
      input.errorMessage = 'Este campo es requerido';
    }

    // Email validation
    if (input.label === 'Email' && input.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.value)) {
        input.hasError = true;
        input.errorMessage = 'Email inválido';
      }
    }

    // Password validation
    if (input.label === 'Password' && input.value) {
      if (input.value.length < 8) {
        input.hasError = true;
        input.errorMessage = 'Password debe tener al menos 8 caracteres';
      }
    }
  }

  // ============================================
  // MÉTODOS DE FORMULARIO
  // ============================================

  submitForm(): void {
    console.log('Formulario enviado');
    
    // Recolectar datos
    const formData = {
      name: this.nameInput.value,
      email: this.emailInput.value,
      password: this.passwordInput.value,
      country: this.countryInput.value,
      bio: this.bioInput.value,
      notifications: this.notificationsInput.value,
      interests: this.interestsInput.value,
      birthday: this.birthdayInput.value,
      phone: this.phoneInput.value,
      price: this.priceInput.value
    };

    console.log('Datos del formulario:', formData);
    
    // Aquí enviarías al backend
    // this.apiService.submitForm(formData).subscribe(...);
  }

  resetForm(): void {
    console.log('Formulario reiniciado');
    
    this.nameInput.value = '';
    this.emailInput.value = '';
    this.passwordInput.value = '';
    this.countryInput.value = '';
    this.bioInput.value = '';
    this.notificationsInput.value = false;
    this.interestsInput.value = '';
    this.birthdayInput.value = '';
    this.phoneInput.value = '';
    this.priceInput.value = '';
  }

  // Método para obtener errores
  hasErrors(): boolean {
    return [
      this.nameInput,
      this.emailInput,
      this.passwordInput,
      this.countryInput,
      this.bioInput
    ].some(input => input.hasError);
  }

  // Método para obtener valores
  getFormValues(): any {
    return {
      name: this.nameInput.value,
      email: this.emailInput.value,
      password: this.passwordInput.value,
      country: this.countryInput.value,
      bio: this.bioInput.value,
      notifications: this.notificationsInput.value,
      interests: this.interestsInput.value,
      birthday: this.birthdayInput.value,
      phone: this.phoneInput.value,
      price: this.priceInput.value
    };
  }
}
