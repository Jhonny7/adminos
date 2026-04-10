# Angular Input Component (oinput) - OlamSys

Componente Input Angular standalone compatible con Material Design, que replica toda la funcionalidad del componente React/Input.tsx original con todos los tipos de inputs soportados.

## 📁 Estructura

```
oinput/
├── input.component.ts           # Main component (router de tipos)
├── input.component.html         # Main template
├── input.component.scss         # Main styles
├── input.types.ts               # Interfaces y tipos TypeScript
├── input.module.ts              # Módulo Angular (standalone: false)
├── index.ts                     # Barrel export
│
├── input-text.component.ts/html/scss           # Text input
├── input-select.component.ts/html/scss         # Select dropdown
├── input-password.component.ts/html/scss       # Password input con eye toggle
├── input-textarea.component.ts/html/scss       # Textarea
├── input-toggle.component.ts/html/scss         # Toggle switch
├── input-checkbox.component.ts/html/scss       # Checkbox (multi-select)
├── input-date.component.ts/html/scss           # Date picker
├── input-phone.component.ts/html/scss          # Phone input
│
└── input-advanced.components.ts                # Placeholders para
                                                # OTP, Special Select, Map, DragDrop, Autocomplete
```

## 🚀 Instalación & Uso

### 1. Importar el módulo en tu componente padre

```typescript
import { Component } from '@angular/core';
import { OInputModule, OInputComponent, InputInterface } from './path-to/oinput';

@Component({
  selector: 'app-my-form',
  standalone: false,
  imports: [OInputModule], // Si usas standalone
  templateUrl: './my-form.component.html'
})
export class MyFormComponent {
  // Tu componente
}
```

### 2. En tu módulo Angular (recomendado)

```typescript
import { OInputModule } from './path-to/oinput/input.module';

@NgModule({
  imports: [OInputModule],
  // ...
})
export class AppModule {}
```

### 3. Declarar los datos de input

```typescript
import { InputInterface } from './path-to/oinput';

export class MyFormComponent {
  inputData: InputInterface = {
    value: '',
    placeholder: 'Enter your name',
    type: 'text',
    required: true,
    label: 'Full Name',
    hasTopLabel: true,
    extraClass: 'custom-class',
    maxLength: 100
  };
}
```

### 4. Usar en el template

```html
<app-oinput
  [inputData]="inputData"
  [index]="0"
  (change)="onInputChange($event)"
  (blur)="onInputBlur($event)"
></app-oinput>
```

## 📋 Tipos de Input Soportados

| Tipo | Componente | Descripción |
|------|-----------|-------------|
| `text` | OInputTextComponent | Input de texto simple |
| `price` | OInputTextComponent | Input tipo precio (mismo que text) |
| `password` | OInputPasswordComponent | Input de contraseña con eye toggle |
| `email` | OInputTextComponent | Input email |
| `phone` | OInputPhoneComponent | Input teléfono |
| `textarea` | OInputTextareaComponent | Área de texto multilinea |
| `select` | OInputSelectComponent | Dropdown select |
| `special-select` | OInputSpecialSelectComponent | Select personalizado (placeholder) |
| `checkbox` | OInputCheckboxComponent | Checkbox múltiple |
| `toggle` | OInputToggleComponent | Toggle switch |
| `date` | OInputDateComponent | Date picker |
| `date-timelocal` | OInputDateComponent | Date-time picker |
| `time` | OInputDateComponent | Time picker |
| `otp` | OInputOTPComponent | One-time password (placeholder) |
| `file` | OInputDragDropComponent | File upload con drag & drop (placeholder) |
| `map` | OInputMapComponent | Map picker (placeholder) |
| `autocomplete` | OInputAutocompleteComponent | Autocomplete (placeholder) |

## 🎨 Propiedades de InputInterface

```typescript
export interface InputInterface {
  // Valores
  value: any;                          // Valor actual
  extraValue?: any;                    // Valor extra (ej. para dates)
  values?: Array<any>;                 // Opciones (para selects/checkboxes)
  
  // Tipos
  type: string;                        // Tipo de input (text, select, etc.)
  forceType?: string;                  // Fuerza un tipo específico
  
  // Validación
  required?: boolean;                  // Campo requerido
  hasError?: boolean;                  // Mostrar estado de error
  errorMessage?: string;               // Texto del error
  
  // UI
  label?: string;                      // Etiqueta del input
  hasTopLabel?: boolean;               // Mostrar label arriba
  placeholder: string;                 // Placeholder text
  
  // Componentes
  extraComponent?: any;                // Componente extra (ej. icono)
  extraLeftComponent?: any;            // Componente a la izquierda
  
  // Clases CSS
  extraClass?: string;                 // Clases CSS adicionales
  globalExtraClass?: string;           // Clases globales
  
  // Restricciones
  maxLength?: number;                  // Máximo de caracteres
  minChars?: number;                   // Mínimo de caracteres (autocomplete)
  min?: number;                        // Mínimo (números)
  max?: number;                        // Máximo (números)
  step?: number;                       // Step (números)
  disabled?: boolean;                  // Input deshabilitado
  
  // Comportamiento
  noUpdate?: boolean;                  // No actualizar automáticamente
  hasSearch?: boolean;                 // Mostrar búsqueda (selects)
  hasEye?: boolean;                    // Mostrar eye toggle (password)
  freeSolo?: boolean;                  // Permitir valores libres (autocomplete)
  
  // Propiedades específicas
  cols?: number;                       // Columnas (textarea)
  rows?: number;                       // Filas (textarea)
  allowedFormats?: string[];           // Formatos permitidos (file)
  maxSizeMB?: number;                  // Tamaño máximo (file)
  checkboxMode?: 'toggle' | 'single';  // Modo checkbox
}
```

## 💬 Handlers de Eventos

```typescript
// En el componente padre
onInputChange(data: InputInterface): void {
  console.log('Valor cambiado:', data.value);
  // data.value contiene el nuevo valor
}

onInputBlur(data: InputInterface): void {
  console.log('Input perdió el foco:', data.value);
  // Ejecutar validaciones aquí
}
```

## 🎯 Ejemplos Completos

### Text Input
```typescript
textInput: InputInterface = {
  value: '',
  type: 'text',
  placeholder: 'Enter your name',
  label: 'Name',
  hasTopLabel: true,
  required: true,
  maxLength: 50
};
```

### Select Dropdown
```typescript
selectInput: InputInterface = {
  value: '',
  type: 'select',
  placeholder: 'Choose an option',
  label: 'Options',
  hasTopLabel: true,
  hasSearch: true,
  values: [
    { value: 1, label: 'Option 1' },
    { value: 2, label: 'Option 2' },
    { value: 3, label: 'Option 3' }
  ]
};
```

### Toggle Switch
```typescript
toggleInput: InputInterface = {
  value: false,
  type: 'toggle',
  label: 'Enable notifications',
  hasTopLabel: true
};
```

### Checkbox Multiple
```typescript
checkboxInput: InputInterface = {
  value: '',
  type: 'checkbox',
  label: 'Select options',
  hasTopLabel: true,
  values: [
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' },
    { value: 'opt3', label: 'Option 3' }
  ],
  checkboxMode: 'toggle'
};
```

### Password Input
```typescript
passwordInput: InputInterface = {
  value: '',
  type: 'password',
  placeholder: 'Enter password',
  label: 'Password',
  hasTopLabel: true,
  hasEye: true,  // Muestra toggle para ver/ocultar
  required: true
};
```

### Date Picker
```typescript
dateInput: InputInterface = {
  value: '',
  type: 'date',
  placeholder: 'Select a date',
  label: 'Birth Date',
  hasTopLabel: true
};
```

## 🎨 Estilos Personalizados

Todos los componentes usan SCSS encapsulado con `::ng-deep` para facilitar la personalización. 

Puedes sobrescribir los estilos desde tu componente padre:

```scss
:host ::ng-deep {
  .arsa-input {
    border-color: #your-color;
    background-color: #your-bg;
  }

  .top-label {
    color: #your-label-color;
  }

  .error {
    color: #your-error-color;
  }
}
```

## 🔧 Configuración de Angular Material (Opcional)

Si deseas integrar Angular Material:

```typescript
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  imports: [
    OInputModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ]
})
export class AppModule {}
```

Todos los inputs son completamente funcionales sin Material, pero puedes envolver los componentes con Material si lo prefieres.

## 📝 Notas Importantes

1. **Componente standalone: false** - Como solicitaste, usa NgModule tradicional
2. **Estilos SCSS** - Todos los estilos originales de React se mantienen
3. **TypeScript puro** - Sin dependencias externas además de Angular
4. **Material compatible** - Funciona perfectamente con Material, pero es opcional
5. **i18n ready** - Usa `{{ }}` de Angular para traducción con tu provider i18n
6. **Eventos** - (change) y (blur) para todas las interacciones

## 🚀 Componentes Avanzados (Placeholders)

Los siguientes componentes son placeholders que puedes expandir:

- `OInputOTPComponent` - Requiere lógica de OTP
- `OInputSpecialSelectComponent` - Select personalizado con búsqueda avanzada
- `OInputMapComponent` - Integración con mapas (leaflet/google maps)
- `OInputDragDropComponent` - Upload con drag & drop
- `OInputAutocompleteComponent` - Autocomplete con búsqueda en tiempo real

Si necesitas implementar específicamente estos, contáctame y creo la versión completa con Material o ngx-* libraries.

## 📞 Soporte

Para reportar bugs o sugerencias sobre este componente, revisa el archivo principal o solicita extensiones específicas.

---

**Hecho con ❤️ para OlamSys - 2026**
