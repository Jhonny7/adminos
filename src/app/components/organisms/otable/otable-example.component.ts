import { Component, OnInit } from '@angular/core';
import { Column, TableAction, OTableProps } from './otable.types';

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  salary: number;
  department: string;
  active: boolean;
  joinDate: string;
}

@Component({
  selector: 'app-otable-example',
  templateUrl: './otable-example.component.html',
  styleUrls: ['./otable-example.component.scss'],
  standalone: false
})
export class OTableExampleComponent implements OnInit {

  // ============================================
  // SAMPLE DATA
  // ============================================

  users: User[] = [
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@example.com',
      age: 28,
      salary: 45000.50,
      department: 'IT',
      active: true,
      joinDate: '2023-01-15'
    },
    {
      id: 2,
      name: 'María García',
      email: 'maria@example.com',
      age: 32,
      salary: 52000.75,
      department: 'HR',
      active: false,
      joinDate: '2022-08-20'
    },
    {
      id: 3,
      name: 'Carlos López',
      email: 'carlos@example.com',
      age: 25,
      salary: 38000.00,
      department: 'Finance',
      active: true,
      joinDate: '2023-03-10'
    },
    {
      id: 4,
      name: 'Ana Rodríguez',
      email: 'ana@example.com',
      age: 29,
      salary: 48000.25,
      department: 'Marketing',
      active: true,
      joinDate: '2022-11-05'
    },
    {
      id: 5,
      name: 'Pedro Sánchez',
      email: 'pedro@example.com',
      age: 35,
      salary: 60000.00,
      department: 'IT',
      active: false,
      joinDate: '2021-12-01'
    }
  ];

  // ============================================
  // TABLE CONFIGURATION
  // ============================================

  columns: Column[] = [
    {
      key: 'id',
      label: 'ID',
      visible: true,
      sortable: true
    },
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
    },
    {
      key: 'salary',
      label: 'Salario',
      visible: true,
      sortable: true,
      editable: true,
      inputType: 'price',
      decimalsCount: 2,
      render: (value) => `$${Number(value).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`
    },
    {
      key: 'department',
      label: 'Departamento',
      visible: true,
      sortable: true,
      editable: true,
      inputType: 'select',
      options: [
        { value: 'IT', label: 'Tecnología' },
        { value: 'HR', label: 'Recursos Humanos' },
        { value: 'Finance', label: 'Finanzas' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Sales', label: 'Ventas' }
      ]
    },
    {
      key: 'active',
      label: 'Activo',
      visible: true,
      sortable: true,
      editable: true,
      inputType: 'select',
      options: [
        { value: 'true', label: 'Sí' },
        { value: 'false', label: 'No' }
      ],
      render: (value) => value ? '✅' : '❌'
    },
    {
      key: 'joinDate',
      label: 'Fecha Ingreso',
      visible: true,
      sortable: true,
      editable: true,
      inputType: 'date',
      render: (value) => new Date(value).toLocaleDateString('es-ES')
    }
  ];

  // ============================================
  // TABLE ACTIONS
  // ============================================

  tableActions: TableAction[] = [
    {
      title: 'Exportar Excel',
      icon: 'file_download',
      action: () => this.exportToExcel()
    },
    {
      title: 'Importar CSV',
      icon: 'file_upload',
      action: () => this.importFromCSV()
    },
    {
      title: 'Limpiar Filtros',
      icon: 'clear_all',
      action: () => this.clearFilters()
    }
  ];

  // ============================================
  // TABLE PROPERTIES
  // ============================================

  tableProps: Partial<OTableProps> = {
    moduleTitle: 'Gestión de Usuarios',
    selectable: true,
    singleSelection: false,
    keyTag: 'id',
    isReorder: true,
    emptyText: 'No hay usuarios registrados',
    filterText: 'Filtros Avanzados',
    disableFilter: false
  };

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  selectedUsers: any[] = [];
  currentData: Record<string, any>[] = [...this.users];

  constructor() {}

  ngOnInit(): void {
    this.currentData = [...this.users];
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  onSelectionChange(selectedKeys: any[]): void {
    this.selectedUsers = selectedKeys;
    console.log('Usuarios seleccionados:', selectedKeys);
  }

  onReorder(rows: Record<string, any>[]): void {
    this.currentData = [...rows];
    console.log('Nuevo orden:', rows);
  }

  onRowsChange(event: { rows: Record<string, any>[]; idx: number; changedKey?: string; changedValue?: any }): void {
    this.currentData = [...event.rows];
    console.log('Fila modificada:', {
      index: event.idx,
      key: event.changedKey,
      value: event.changedValue,
      row: event.rows[event.idx]
    });

    // Aquí podrías hacer una llamada a API para guardar cambios
    // this.saveChanges(event.rows[event.idx]);
  }

  onCloseDrawer(open: boolean): void {
    console.log('Drawer cerrado:', open);
  }

  // ============================================
  // ACTION METHODS
  // ============================================

  addUser(): void {
    const newUser: User = {
      id: Math.max(...this.currentData.map(u => u['id'])) + 1,
      name: 'Nuevo Usuario',
      email: 'nuevo@example.com',
      age: 25,
      salary: 30000.00,
      department: 'IT',
      active: true,
      joinDate: new Date().toISOString().split('T')[0]
    };

    this.currentData = [newUser, ...this.currentData];
    console.log('Usuario agregado:', newUser);
  }

  exportToExcel(): void {
    console.log('Exportando a Excel...', this.selectedUsers.length > 0 ? this.selectedUsers : 'todos');
    // Implementar lógica de exportación
    alert('Funcionalidad de exportación a Excel (por implementar)');
  }

  importFromCSV(): void {
    console.log('Importando desde CSV...');
    // Implementar lógica de importación
    alert('Funcionalidad de importación desde CSV (por implementar)');
  }

  clearFilters(): void {
    console.log('Limpiando filtros...');
    // Implementar lógica de limpieza de filtros
    alert('Filtros limpiados');
  }

  deleteSelected(): void {
    if (this.selectedUsers.length === 0) {
      alert('Selecciona al menos un usuario para eliminar');
      return;
    }

    if (confirm(`¿Eliminar ${this.selectedUsers.length} usuario(s) seleccionado(s)?`)) {
      this.currentData = this.currentData.filter(user => !this.selectedUsers.includes(user['id']));
      this.selectedUsers = [];
      console.log('Usuarios eliminados');
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  getSelectedCount(): number {
    return this.selectedUsers.length;
  }

  getTotalUsers(): number {
    return this.currentData.length;
  }

  getActiveUsers(): number {
    return this.currentData.filter(u => u['active']).length;
  }

  // ============================================
  // FILTER COMPONENT (placeholder)
  // ============================================

  filterComponent = {
    template: `
      <div class="filter-panel">
        <h3>Filtros Avanzados</h3>
        <div class="filter-group">
          <label>Departamento:</label>
          <select>
            <option value="">Todos</option>
            <option value="IT">Tecnología</option>
            <option value="HR">Recursos Humanos</option>
            <option value="Finance">Finanzas</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Estado:</label>
          <select>
            <option value="">Todos</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
        <div class="filter-actions">
          <button class="btn-secondary">Limpiar</button>
          <button class="btn-primary">Aplicar</button>
        </div>
      </div>
    `,
    styles: [`
      .filter-panel {
        padding: 20px;
      }
      .filter-panel h3 {
        margin-bottom: 20px;
        color: #3b6ec4;
      }
      .filter-group {
        margin-bottom: 15px;
      }
      .filter-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
      }
      .filter-group select {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      .filter-actions {
        display: flex;
        gap: 10px;
        margin-top: 20px;
      }
      .btn-primary {
        background: #3b6ec4;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
      }
      .btn-secondary {
        background: #f5f5f5;
        color: #333;
        border: 1px solid #ddd;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
      }
    `]
  };
}
