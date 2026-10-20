import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    QueryList,
    ViewChildren,
    ViewEncapsulation,
    afterNextRender,
    inject,
    signal
} from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { paths } from '../../../environments/environment.prod';
import { GenericService } from '../../services/generic.service';

interface OptionItem { clave: string; etiqueta: string; }

interface CatalogResponse {
    tipos_produccion?: OptionItem[];
    estados?: OptionItem[];
    municipios?: OptionItem[];
    localidades?: OptionItem[];
}

interface SurfaceResponse {
    superficie_total_ha?: number;
    usos?: Array<{ clave: string; etiqueta: string; ha: number; pct: number }>;
}

interface ProducerSize {
    clave: string;
    etiqueta: string;
    rango_animales: { min: number; max: number };
    productores: number;
    por_finalidad: { carne: number; leche: number; doble_proposito: number };
    pct: number;
}

interface ProducerSizeResponse {
    total_productores?: number;
    tamanos?: ProducerSize[];
}

interface SupportProgram {
    clave: string;
    etiqueta: string;
    productores: number;
    monto_mxn: number;
    pct_productores: number;
}

interface SupportsResponse {
    total_productores?: number;
    con_apoyo?: number;
    sin_apoyo?: number;
    con_apoyo_pct?: number;
    monto_total_mxn?: number;
    programas?: SupportProgram[];
    siap_url?: string;
}

interface ProductionType {
    clave: string;
    etiqueta: string;
    productores: number;
    pct: number;
}

interface ProductionResponse {
    total_productores?: number;
    tipos?: ProductionType[];
}

interface AnimalLoadResponse {
    cabezas?: number;
    capacidad_cabezas?: number;
    area_pastoreo_ha?: number;
    carga_cab_ha?: number;
    uso_capacidad_pct?: number;
}

interface OwnershipDocument {
    id: number;
    nombre: string;
    extension: string;
    subido_el: string;
    url?: string | null;
}

interface PropertyResponse {
    propietario?: string;
    rancho?: string;
    empresa?: string;
    estado?: string;
    municipio?: string;
    localidad?: string;
    clave_upp?: string;
    documentos?: OwnershipDocument[];
}

@Component({
    selector: 'app-rancho',
    templateUrl: './rancho.html',
    styleUrls: ['./rancho.scss'],
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Rancho implements OnInit {
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly genericService = inject(GenericService);

    @ViewChildren(BaseChartDirective)
    private readonly chartDirectives?: QueryList<BaseChartDirective>;

    protected readonly chartsReady = signal(false);

    public loading = true;
    public refreshing = false;
    public errorMessage = '';
    public searchQuery = '';
    public selectedEstado = '';
    public selectedMunicipio = '';
    public selectedLocalidad = '';
    public selectedProductionType = '';

    public estados: OptionItem[] = [];
    public municipios: OptionItem[] = [];
    public localidades: OptionItem[] = [];
    public tiposProduccion: OptionItem[] = [];

    public surface: SurfaceResponse = { usos: [] };
    public producerSize: ProducerSizeResponse = { tamanos: [] };
    public supports: SupportsResponse = { programas: [] };
    public production: ProductionResponse = { tipos: [] };
    public animalLoad: AnimalLoadResponse = {};
    public property: PropertyResponse = { documentos: [] };
    public sizeView: 'total' | 'finalidad' = 'total';

    public sizeDoughnutData: ChartData<'doughnut'> = this.emptyDoughnut();
    public sizeBarData: ChartData<'bar'> = this.emptyBar();
    public supportBarData: ChartData<'bar'> = this.emptyBar();

    public readonly doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: { legend: { display: false } }
    };

    public readonly barOptions: ChartConfiguration<'bar'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { beginAtZero: true, ticks: { color: '#687387' }, grid: { color: '#e7ecf1' } },
            y: { beginAtZero: true, ticks: { color: '#687387' }, grid: { color: '#e7ecf1' } }
        }
    };

    public readonly supportBarOptions: ChartConfiguration<'bar'>['options'] = {
        ...this.barOptions,
        indexAxis: 'y',
        scales: {
            x: { beginAtZero: true, ticks: { color: '#687387' }, grid: { color: '#e7ecf1' } },
            y: { ticks: { color: '#687387' }, grid: { display: false } }
        }
    };

    constructor() {
        afterNextRender(() => {
            this.chartsReady.set(true);
            this.cdr.detectChanges();
            this.refreshChartsSoon();
        });
    }

    ngOnInit(): void {
        this.loadCatalogs();
        this.loadData();
    }

    public loadData(): void {
        this.loading = true;
        this.errorMessage = '';
        const params = this.filterParams();

        forkJoin({
            surface: this.genericService.sendGetParams<SurfaceResponse>(paths.ranchoSuperficie, params, true).pipe(catchError(() => of(null))),
            size: this.genericService.sendGetParams<ProducerSizeResponse>(paths.ranchoTamanoProductor, params, true).pipe(catchError(() => of(null))),
            supports: this.genericService.sendGetParams<SupportsResponse>(paths.ranchoApoyos, params, true).pipe(catchError(() => of(null))),
            production: this.genericService.sendGetParams<ProductionResponse>(paths.ranchoTipoProduccion, params, true).pipe(catchError(() => of(null))),
            animalLoad: this.genericService.sendGetParams<AnimalLoadResponse>(paths.ranchoCargaAnimal, params, true).pipe(catchError(() => of(null))),
            property: this.genericService.sendGetParams<PropertyResponse>(paths.ranchoRegistroPropiedad, params, true).pipe(catchError(() => of(null)))
        }).pipe(finalize(() => {
            this.loading = false;
            this.cdr.markForCheck();
            this.refreshChartsSoon();
        })).subscribe((response) => {
            if (response.surface) { this.surface = response.surface; }
            if (response.size) { this.producerSize = response.size; this.applySizeCharts(); }
            if (response.supports) { this.supports = response.supports; this.applySupportChart(); }
            if (response.production) { this.production = response.production; }
            if (response.animalLoad) { this.animalLoad = response.animalLoad; }
            if (response.property) { this.property = response.property; }
            if (!Object.values(response).some(Boolean)) {
                this.errorMessage = 'No fue posible cargar los datos del rancho.';
            }
            this.cdr.markForCheck();
        });
    }

    private loadCatalogs(estado = '', municipio = ''): void {
        const params: Record<string, string> = {};
        if (estado) { params['estado'] = estado; }
        if (municipio) { params['municipio'] = municipio; }

        this.genericService.sendGetParams<CatalogResponse>(paths.ranchoCatalogos, params, true).subscribe({
            next: (response) => {
                this.tiposProduccion = response?.tipos_produccion || this.tiposProduccion;
                this.estados = response?.estados || this.estados;
                this.municipios = response?.municipios || [];
                this.localidades = response?.localidades || [];
                this.cdr.markForCheck();
            },
            error: () => this.cdr.markForCheck()
        });
    }

    public onEstadoChange(): void {
        this.selectedMunicipio = '';
        this.selectedLocalidad = '';
        this.municipios = [];
        this.localidades = [];
        this.loadCatalogs(this.selectedEstado);
        this.loadData();
    }

    public onMunicipioChange(): void {
        this.selectedLocalidad = '';
        this.localidades = [];
        this.loadCatalogs(this.selectedEstado, this.selectedMunicipio);
        this.loadData();
    }

    public onFilterChange(): void { this.loadData(); }
    public onSearch(): void { this.loadData(); }

    private filterParams(): Record<string, string> {
        const params: Record<string, string> = {};
        if (this.selectedEstado) { params['estado'] = this.selectedEstado; }
        if (this.selectedMunicipio) { params['municipio'] = this.selectedMunicipio; }
        if (this.selectedLocalidad) { params['localidad'] = this.selectedLocalidad; }
        if (this.selectedProductionType) { params['tipo_produccion'] = this.selectedProductionType; }
        if (this.searchQuery.trim()) { params['q'] = this.searchQuery.trim(); }
        return params;
    }

    public exportCsv(): void {
        const options = { params: this.filterParams(), responseType: 'blob' as 'json' };
        this.genericService.sendGetRequestParams<Blob>(paths.ranchoExport, options, true).subscribe({
            next: (blob) => {
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = 'resumen-rancho.csv';
                anchor.click();
                URL.revokeObjectURL(url);
            },
            error: () => {
                this.errorMessage = 'No fue posible exportar el CSV.';
                this.cdr.markForCheck();
            }
        });
    }

    public refreshData(): void {
        this.refreshing = true;
        this.genericService.sendPostRequest(paths.ranchoCacheFlush, {}, true).pipe(
            catchError(() => of(null)),
            finalize(() => {
                this.refreshing = false;
                this.loadData();
            })
        ).subscribe();
    }

    public setSizeView(view: 'total' | 'finalidad'): void {
        this.sizeView = view;
        this.applySizeCharts();
        this.cdr.markForCheck();
        this.refreshChartsSoon();
    }

    private applySizeCharts(): void {
        const items = this.producerSize.tamanos || [];
        const colors = ['#9d9da0', '#ad8127', '#22685d', '#171a1c'];
        this.sizeDoughnutData = {
            labels: items.map((item) => item.etiqueta),
            datasets: [{ data: items.map((item) => item.productores), backgroundColor: colors, borderColor: '#fff', borderWidth: 2 }]
        };
        if (this.sizeView === 'total') {
            this.sizeBarData = {
                labels: items.map((item) => item.etiqueta),
                datasets: [{ label: 'Productores', data: items.map((item) => item.productores), backgroundColor: colors, borderRadius: 7, borderSkipped: false }]
            };
        } else {
            this.sizeBarData = {
                labels: items.map((item) => item.etiqueta),
                datasets: [
                    { label: 'Carne', data: items.map((item) => item.por_finalidad.carne), backgroundColor: '#a1244e', borderRadius: 5 },
                    { label: 'Leche', data: items.map((item) => item.por_finalidad.leche), backgroundColor: '#ad8127', borderRadius: 5 },
                    { label: 'Doble propósito', data: items.map((item) => item.por_finalidad.doble_proposito), backgroundColor: '#22685d', borderRadius: 5 }
                ]
            };
        }
    }

    private applySupportChart(): void {
        const items = this.supports.programas || [];
        this.supportBarData = {
            labels: items.map((item) => item.etiqueta),
            datasets: [{ label: 'Productores', data: items.map((item) => item.productores), backgroundColor: ['#22685d', '#ad8127', '#a1244e', '#9d9da0'], borderRadius: 7, borderSkipped: false }]
        };
    }

    public formatNumber(value: number | null | undefined): string {
        return new Intl.NumberFormat('es-MX').format(value || 0);
    }

    public formatMoney(value: number | null | undefined): string {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value || 0);
    }

    public percentage(value: number, total: number): number {
        return total ? Math.round((value / total) * 100) : 0;
    }

    public rangeLabel(item: ProducerSize): string {
        return `${item.rango_animales.min}–${item.rango_animales.max} animales`;
    }

    public productionIcon(clave: string): string {
        return { pie_cria: '🐄', engorda: '⚡', leche: '🥛', doble_proposito: '🔄' }[clave] || '📦';
    }

    public usagePercent(): number {
        return Math.min(this.animalLoad.uso_capacidad_pct || 0, 100);
    }

    private emptyDoughnut(): ChartData<'doughnut'> {
        return { labels: [], datasets: [{ data: [], backgroundColor: [] }] };
    }

    private emptyBar(): ChartData<'bar'> {
        return { labels: [], datasets: [] };
    }

    private refreshChartsSoon(): void {
        if (!this.chartsReady()) { return; }
        requestAnimationFrame(() => this.chartDirectives?.forEach((directive) => {
            directive.chart?.resize();
            directive.update();
        }));
    }
}
