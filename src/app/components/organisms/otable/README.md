# OTable Component

Un componente de tabla avanzado para Angular que proporciona funcionalidades completas de gestión de datos con una interfaz moderna y responsiva.

## Características

- ✅ **Ordenamiento**: Ordena columnas de forma ascendente/descendente
- ✅ **Filtrado Avanzado**: Panel lateral con filtros personalizables
- ✅ **Selección Múltiple**: Selecciona filas individuales o todas
- ✅ **Edición Inline**: Edita celdas directamente en la tabla
- ✅ **Reordenamiento**: Arrastra y suelta filas para cambiar el orden
- ✅ **Responsive**: Diseño adaptativo para móviles y tablets
- ✅ **Acciones Personalizadas**: Botones de acción en el header
- ✅ **Tipos de Input**: Soporte para text, number, select, date, price, etc.
- ✅ **Renderizado Personalizado**: Funciones personalizadas para mostrar datos
- ✅ **Eventos Completos**: Callbacks para todos los cambios de estado

## Instalación

```bash
# El componente ya está incluido en common-lib
# Solo necesitas importarlo en tu módulo
```

## Uso Básico

### 1. Importar el módulo

```typescript
import { OTableModule } from './components/organisims/table/otable/otable.module';

@NgModule({
  imports: [
    // ... otros módulos
    OTableModule
  ]
})
export class YourModule { }
```

### 2. Configurar columnas

```typescript
import { Column } from './components/organisims/table/otable/otable';

export class YourComponent {
  columns: Column[] = [
    {
      key: 'name',
      label: 'Nombre',
      visible: true,
      sortable: true,
      editable: true,
      inputType: 'text'
    },
    {
      key: 'email',
      label: 'Email',
      visible: true,
      sortable: true,
      editable: true,
      inputType: 'text'
    },
    {
      key: 'age',
      label: 'Edad',
      visible: true,
      sortable: true,
      editable: true,
      inputType: 'number'
    }
  ];
}
```

### 3. Usar en template

```html
<otable
  [columns]="columns"
  [data]="yourData"
  [props]="tableProps"
  (rowsChange)="onRowsChange($event)">
</otable>
```

## API Reference

### Props (OTableProps)

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `moduleTitle` | `string` | `''` | Título del módulo |
| `selectable` | `boolean` | `false` | Habilita selección de filas |
| `singleSelection` | `boolean` | `false` | Solo permite selección única |
| `keyTag` | `string` | `'id'` | Clave única para identificar filas |
| `isReorder` | `boolean` | `false` | Habilita reordenamiento por drag & drop |
| `emptyText` | `string` | `'No data'` | Texto cuando no hay datos |
| `filterText` | `string` | `'Filters'` | Texto del botón de filtros |
| `disableFilter` | `boolean` | `false` | Deshabilita el panel de filtros |

### Column Interface

```typescript
interface Column {
  key: string;              // Clave del dato
  label: string;            // Etiqueta visible
  visible?: boolean;        // Si la columna es visible
  sortable?: boolean;       // Si se puede ordenar
  editable?: boolean;       // Si se puede editar
  inputType?: InputType;    // Tipo de input para edición
  options?: SelectOption[]; // Opciones para select
  decimalsCount?: number;   // Decimales para price
  render?: (value: any) => string; // Función de renderizado
  width?: string;           // Ancho fijo de columna
}
```

### Tipos de Input Soportados

- `'text'` - Campo de texto
- `'number'` - Campo numérico
- `'price'` - Campo de precio con formato
- `'select'` - Lista desplegable
- `'date'` - Selector de fecha
- `'textarea'` - Área de texto

### Eventos

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `selectionChange` | `any[]` | Cambia la selección de filas |
| `reorder` | `any[]` | Nuevo orden de filas |
| `rowsChange` | `RowsChangeEvent` | Cambios en los datos |
| `closeDrawer` | `boolean` | Se cierra el drawer de filtros |

```typescript
interface RowsChangeEvent {
  rows: any[];           // Todos los datos
  idx: number;           // Índice de la fila modificada
  changedKey?: string;   // Clave modificada
  changedValue?: any;    // Nuevo valor
}
```

## Ejemplos Avanzados

### Tabla con Selección y Acciones

```typescript
export class UsersTableComponent {
  columns: Column[] = [
    { key: 'id', label: 'ID', visible: true, sortable: true },
    { key: 'name', label: 'Nombre', visible: true, sortable: true, editable: true, inputType: 'text' },
    { key: 'department', label: 'Departamento', visible: true, editable: true, inputType: 'select',
      options: [
        { value: 'IT', label: 'Tecnología' },
        { value: 'HR', label: 'Recursos Humanos' }
      ]
    }
  ];

  tableProps: Partial<OTableProps> = {
    moduleTitle: 'Gestión de Usuarios',
    selectable: true,
    isReorder: true
  };

  tableActions: TableAction[] = [
    {
      title: 'Exportar',
      icon: 'file_download',
      action: () => this.exportData()
    }
  ];

  onRowsChange(event: RowsChangeEvent) {
    // Guardar cambios en API
    console.log('Datos modificados:', event);
  }

  onSelectionChange(selectedKeys: any[]) {
    console.log('Seleccionados:', selectedKeys);
  }
}
```

### Filtros Personalizados

```typescript
export class FilteredTableComponent {
  filterComponent = {
    template: `
      <div class="custom-filters">
        <h3>Filtros Avanzados</h3>
        <div class="filter-row">
          <label>Estado:</label>
          <select [(ngModel)]="statusFilter">
            <option value="">Todos</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>
        <button (click)="applyFilters()">Aplicar</button>
      </div>
    `,
    styles: [`
      .custom-filters { padding: 20px; }
      .filter-row { margin-bottom: 15px; }
    `]
  };

  applyFilters() {
    // Lógica de filtrado
  }
}
```

## Estilos y Temas

### Variables CSS Personalizables

```scss
.otable-container {
  --otable-primary-color: #3b6ec4;
  --otable-secondary-color: #f8f9fa;
  --otable-text-color: #333;
  --otable-border-color: #e9ecef;
  --otable-hover-color: #f1f3f4;
  --otable-selected-color: #e3f2fd;
}
```

### Responsive Design

El componente incluye breakpoints automáticos:

- **Desktop**: `> 768px` - Vista completa de tabla
- **Tablet**: `≤ 768px` - Tabla con scroll horizontal
- **Mobile**: `≤ 480px` - Vista de tarjetas apiladas

### Tema Oscuro

```scss
@media (prefers-color-scheme: dark) {
  :root {
    --otable-primary-color: #64b5f6;
    --otable-secondary-color: #404040;
    --otable-text-color: #e0e0e0;
    --otable-border-color: #555;
    --otable-hover-color: #505050;
  }
}
```

## Mejores Prácticas

### 1. Optimización de Rendimiento

```typescript
// Usa trackBy para listas grandes
trackByFn(index: number, item: any): any {
  return item.id; // o cualquier clave única
}

// Lazy loading para datos grandes
loadData(page: number) {
  // Cargar datos por páginas
}
```

### 2. Manejo de Estado

```typescript
export class TableComponent implements OnChanges {
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      // Actualizar datos locales
      this.processData();
    }
  }

  private processData() {
    // Validar y procesar datos
  }
}
```

### 3. Validación de Datos

```typescript
onRowsChange(event: RowsChangeEvent) {
  const { rows, idx, changedKey, changedValue } = event;

  // Validar cambios
  if (!this.validateChange(changedKey, changedValue)) {
    // Revertir cambio
    return;
  }

  // Aplicar cambio
  this.saveToAPI(rows[idx]);
}

private validateChange(key: string, value: any): boolean {
  // Lógica de validación
  return true;
}
```

## Solución de Problemas

### Problema: La tabla no se renderiza

**Solución**: Verifica que:
- El módulo `OTableModule` esté importado
- Las columnas tengan la propiedad `key` correcta
- Los datos sean un array válido

### Problema: La edición no funciona

**Solución**: Asegúrate de que:
- La columna tenga `editable: true`
- El `inputType` sea válido
- El evento `rowsChange` esté conectado

### Problema: El responsive no funciona

**Solución**: Verifica que:
- Los estilos SCSS estén incluidos
- No haya estilos CSS que sobrescriban los breakpoints
- La tabla tenga suficiente espacio en el contenedor

## Migración desde React

Si vienes del componente React `DynamicTable`, aquí están los cambios principales:

| React | Angular |
|-------|---------|
| `columns` prop | `[columns]` input |
| `data` prop | `[data]` input |
| `onChange` callback | `(rowsChange)` output |
| `useState` hooks | Component properties |
| JSX templates | Angular templates |
| `className` | `class` + `[ngClass]` |

## Contribución

Para contribuir al componente:

1. Sigue las convenciones de código del proyecto
2. Agrega tests para nuevas funcionalidades
3. Actualiza la documentación
4. Prueba en diferentes navegadores

## Changelog

### v1.0.0
- ✅ Implementación inicial completa
- ✅ Soporte para todos los tipos de input
- ✅ Diseño responsive
- ✅ Drag & drop para reordenamiento
- ✅ Panel de filtros lateral
- ✅ Selección múltiple
- ✅ Edición inline
- ✅ Acciones personalizadas

## Soporte

Para soporte técnico, contacta al equipo de desarrollo o crea un issue en el repositorio del proyecto.