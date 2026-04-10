# AlertService Modal Methods - Documentation

## Overview

The enhanced `AlertService` now includes three powerful modal methods for creating iOS-style UI components:

1. **openActionSheet** - iOS-style action sheet with customizable buttons
2. **openPanel** - Position-aware modal panel for components
3. **openPopover** - Context menu popover from click position

---

## Method 1: openActionSheet

Opens an iOS-style bottom action sheet with customizable buttons.

### Signature

```typescript
openActionSheet(
  buttons: IButtonSheet[],
  title?: string,
  hasCancelButton?: boolean,
  hasContentClose?: boolean
): Promise<any>
```

### Interface

```typescript
export interface IButtonSheet {
  text: string;           // Button label
  icon?: string;          // Material icon name (optional)
  handler: Function;      // Callback function
}
```

### Example Usage

```typescript
import { Component, inject } from '@angular/core';
import { AlertService, IButtonSheet } from './services/alert.service';

@Component({
  selector: 'app-example',
  template: `<button (click)="showActionSheet()">Open Sheet</button>`
})
export class ExampleComponent {
  private alertService = inject(AlertService);

  showActionSheet() {
    const buttons: IButtonSheet[] = [
      {
        text: 'Edit',
        icon: 'edit',
        handler: () => {
          console.log('Edit clicked');
          // Your edit logic here
        }
      },
      {
        text: 'Delete',
        icon: 'delete',
        handler: () => {
          console.log('Delete clicked');
          // Your delete logic here
        }
      },
      {
        text: 'Share',
        icon: 'share',
        handler: () => {
          console.log('Share clicked');
          // Your share logic here
        }
      }
    ];

    this.alertService
      .openActionSheet(buttons, 'Options', true, false)
      .then((selectedIndex) => {
        if (selectedIndex !== null) {
          console.log('User selected button:', selectedIndex);
        } else {
          console.log('Action sheet closed');
        }
      });
  }
}
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| buttons | IButtonSheet[] | required | Array of button configurations |
| title | string | '' | Header title |
| hasCancelButton | boolean | true | Show cancel button at bottom |
| hasContentClose | boolean | false | Keep modal open on outside click |

### Features

- ✅ Slide-up animation
- ✅ Customizable buttons with icons
- ✅ Fixed cancel button at bottom
- ✅ Closes automatically on button click
- ✅ Responsive on mobile (full width)

---

## Method 2: openPanel

Opens a modal panel that can display components or HTML content at customizable positions.

### Signature

```typescript
openPanel(
  component: any,           // Component class or HTML string
  title?: string,
  position?: 'bottom' | 'right' | 'left' | 'top',
  hasContentClose?: boolean,
  data?: any
): Promise<any>
```

### Example Usage with Component

```typescript
import { Component, inject, Input } from '@angular/core';
import { AlertService } from './services/alert.service';
import { LoginComponent } from './pages/login/login.component';

@Component({
  selector: 'app-example',
  template: `
    <button (click)="openPanel()">Open Panel</button>
  `
})
export class ExampleComponent {
  private alertService = inject(AlertService);

  openPanel() {
    const panelData = {
      title: 'Login',
      mode: 'modal'
    };

    this.alertService
      .openPanel(
        LoginComponent,
        'Login',
        'right',
        false,
        panelData
      )
      .then(() => {
        console.log('Panel closed');
      });
  }
}
```

### Example Usage with HTML

```typescript
const htmlContent = `
  <div style="padding: 20px;">
    <h3>Welcome</h3>
    <p>This is a panel with custom HTML content</p>
  </div>
`;

this.alertService
  .openPanel(htmlContent, 'Info', 'bottom', false)
  .then(() => {
    console.log('HTML panel closed');
  });
```

### Position Variants

- **'bottom'** - Slides up from bottom (default)
- **'right'** - Slides in from right side (sidebar-style)
- **'left'** - Slides in from left side
- **'top'** - Slides down from top

### Component Data Injection

To receive data in your component:

```typescript
@Component({
  selector: 'app-login',
  template: `<div>{{ title }}</div>`
})
export class LoginComponent {
  @Input() title: string;
  @Input() mode: string;

  // Component receives data automatically via @Input bindings
}
```

### Features

- ✅ Position-aware (bottom, right, left, top)
- ✅ Component or HTML content injection
- ✅ Automatic component change detection
- ✅ Data passing to components
- ✅ Responsive design (panels become full-width on mobile)
- ✅ Smooth slide animations

---

## Method 3: openPopover

Opens a context menu popover that positions itself near the clicked element.

### Signature

```typescript
openPopover(
  buttons?: IButtonSheet[] | null,
  event?: MouseEvent,
  component?: any
): Promise<any>
```

### Example Usage with Buttons

```typescript
@Component({
  selector: 'app-card',
  template: `
    <div class="card">
      <button (click)="openMenu($event)">⋮</button>
    </div>
  `,
  styles: [`
    .card {
      width: 300px;
      padding: 16px;
      border: 1px solid #ccc;
    }
  `]
})
export class CardComponent {
  private alertService = inject(AlertService);

  openMenu(event: MouseEvent) {
    const buttons: IButtonSheet[] = [
      {
        text: 'View',
        icon: 'visibility',
        handler: () => console.log('View clicked')
      },
      {
        text: 'Edit',
        icon: 'edit',
        handler: () => console.log('Edit clicked')
      },
      {
        text: 'Delete',
        icon: 'delete',
        handler: () => console.log('Delete clicked')
      }
    ];

    this.alertService
      .openPopover(buttons, event)
      .then((index) => {
        console.log('Popover closed, button:', index);
      });
  }
}
```

### Example Usage with Component

```typescript
this.alertService
  .openPopover(null, event, MyCustomMenuComponent)
  .then(() => {
    console.log('Popover closed');
  });
```

### Features

- ✅ Positions near click coordinates
- ✅ Auto-adjusts to stay within viewport
- ✅ Minimal distance from screen edges
- ✅ Supports buttons or custom components
- ✅ Auto-closes on outside click
- ✅ Arrow pointer indicator
- ✅ Smooth fade-in animation

---

## Styling Classes

All modals use customizable CSS classes for styling. The styles are in `/src/styles/alert-styles.scss`:

### Action Sheet Classes

```scss
.action-sheet-container { }
.action-sheet-popup { }
.action-sheet-header { }
.action-sheet-buttons { }
.action-sheet-btn { }
```

### Panel Classes

```scss
.panel-container { }
.panel-popup { }
.panel-bottom { }
.panel-right { }
.panel-left { }
.panel-top { }
```

### Popover Classes

```scss
.popover-container { }
.popover-popup { }
.popover-buttons { }
.popover-btn { }
```

---

## Error Handling

All methods return Promises that resolve when the modal closes:

```typescript
this.alertService
  .openActionSheet(buttons, 'Title')
  .then((result) => {
    if (result !== null) {
      console.log('Button selected:', result);
    } else {
      console.log('Modal dismissed');
    }
  })
  .catch((error) => {
    console.error('Modal error:', error);
  });
```

---

## Integration with Existing AlertService Methods

The new modal methods complement existing AlertService methods:

- `successAlert(titulo, mensaje, accion?)` - Simple success alert
- `errorAlert(titulo, mensaje, accion?)` - Simple error alert
- `bottomModals(datos, titulo?, descripcion?, callback?)` - Bottom sheet modal
- `alertWithInputs(accion?, titulo?, mensaje?, confirmButtonText?, placeholder?)` - Alert with text input

All methods work together seamlessly in your application.

---

## Best Practices

1. **Always handle promises** - Use `.then()` or `async/await`
2. **Provide clear titles** - Help users understand context
3. **Use icons** - Material icons improve UX
4. **Keep buttons focused** - 2-4 buttons per sheet is ideal
5. **Test on mobile** - Verify responsive behavior
6. **Handle component cleanup** - Components are properly cleaned up automatically

---

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

Depends on SweetAlert2 and Angular Material icons.
