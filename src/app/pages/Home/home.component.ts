import { Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { Column } from "../../components/organisms/otable";
import { Login } from "../login/login.component";

@Component({
    selector: 'app-home',
    templateUrl: './home.html',
    styleUrls: ['./home.scss'],
    standalone: false,
    encapsulation: ViewEncapsulation.None
})
export class Home implements OnInit, OnDestroy {

    data = [
        { id: 1, name: 'Juan Pérez', email: 'juan@test.com', age: 28, status: 'active' },
        { id: 2, name: 'Ana López', email: 'ana@test.com', age: 32, status: 'inactive' },
        { id: 3, name: 'Carlos Ruiz', email: 'carlos@test.com', age: 24, status: 'active' },
        { id: 4, name: 'María Torres', email: 'maria@test.com', age: 30, status: 'active' },
        { id: 5, name: 'Luis Gómez', email: 'luis@test.com', age: 35, status: 'inactive' }
    ];

    // 🔥 COLUMNAS
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
            inputType: 'text',
             width: 200
        },
        {
            key: 'age',
            label: 'Edad',
            visible: true,
            sortable: true,
            editable: true,
            inputType: 'number',
           
        },
        {
            key: 'status',
            label: 'Estado',
            visible: true,
            editable: true,
            inputType: 'select',
            options: [
                { value: 'active', label: 'Activo' },
                { value: 'inactive', label: 'Inactivo' }
            ]
        }, {
            key: 'email',
            label: 'Email',
            visible: true,
            sortable: true,
            editable: true,
            inputType: 'text',
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
            key: 'status',
            label: 'Estado',
            visible: true,
            editable: true,
            inputType: 'select',
            options: [
                { value: 'active', label: 'Activo' },
                { value: 'inactive', label: 'Inactivo' }
            ]
        }
    ];

    tableProps = {
        moduleTitle: 'Usuarios',
        selectable: true,
        singleSelection: false,
        keyTag: 'id',
        isReorder: true,
        filterText: 'Filtros'
    };

    statusFilter = '';
    nameFilter = '';

    filterComponent = Login;

    originalData = [...this.data];

    applyFilters() {
        this.data = this.originalData.filter(item => {
            const matchName = this.nameFilter
                ? item.name.toLowerCase().includes(this.nameFilter.toLowerCase())
                : true;

            const matchStatus = this.statusFilter
                ? item.status === this.statusFilter
                : true;

            return matchName && matchStatus;
        });
    }

    clearFilters() {
        this.nameFilter = '';
        this.statusFilter = '';
        this.data = [...this.originalData];
    }

    // 🔥 EVENTOS

    onRowsChange(event: any) {
        console.log('Cambio en tabla:', event);
    }

    onSelectionChange(selection: any[]) {
        console.log('Seleccionados:', selection);
    }

    onReorder(data: any[]) {
        console.log('Nuevo orden:', data);
    }

    // 🔥 ACCIONES HEADER

    tableActions = [
        {
            title: 'Exportar',
            icon: 'download',
            action: () => this.export()
        },
        {
            title: 'Agregar',
            icon: 'add',
            action: () => this.add()
        }
    ];

    export() {
        console.log('Exportando...');
    }

    add() {
        console.log('Agregar nuevo...');
    }

    constructor() {

    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {

    }
}