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

interface OptionItem {
    clave: string;
    etiqueta: string;
}

interface CatalogResponse {
    tipos?: OptionItem[];
    condiciones?: OptionItem[];
    tipos_cerco?: OptionItem[];
    estados?: OptionItem[];
    municipios?: OptionItem[];
}

interface Trend {
    direccion?: string;
    puntos?: number;
    comparado_con?: string;
}

interface InfrastructureStatus {
    clave: 'bueno' | 'regular' | 'malo';
    etiqueta: string;
    total: number;
    tendencia?: Trend | null;
}

interface InventoryItem {
    tipo: string;
    etiqueta: string;
    total: number;
    bueno: number;
    regular: number;
    malo: number;
    funcional: number;
    funcional_pct: number;
}

interface SummaryResponse {
    ambito?: { nivel?: string; clave?: string | null; estado?: string };
    filtros?: { tipo?: string | null; condicion?: string | null; q?: string | null };
    total_elementos?: number;
    estados?: InfrastructureStatus[];
    inventario?: InventoryItem[];
}

interface UppBreakdownItem {
    upp: string;
    rancho: string;
    estado_clave: string;
    municipio_clave: string;
    municipio: string;
    total_elementos: number;
    bueno: number;
    regular: number;
    malo: number;
}

interface UppBreakdownResponse {
    total?: number;
    page?: number;
    per_page?: number;
    last_page?: number;
    data?: UppBreakdownItem[];
}

interface NeedResponse {
    funcional?: { elementos: number; total_elementos: number; pct: number };
    necesidad?: { ranchos_con_necesidad: number; total_ranchos: number; pct: number; inversion_estimada_mxn: number };
    brecha_pct?: number;
}

interface FenceType {
    tipo: string;
    etiqueta: string;
    descripcion: string;
    usan: number;
    no_usan: number;
    superficie_ha: number;
    superficie_pct: number;
}

interface FenceResponse {
    productores?: number;
    superficie_total_ha?: number;
    superficie_cercada_ha?: number;
    superficie_sin_cercar_ha?: number;
    superficie_cercada_pct?: number;
    tipos?: FenceType[];
}

interface FenceUppItem {
    upp: string;
    rancho: string;
    estado_clave: string;
    municipio_clave: string;
    municipio: string;
    cerco_vivo: boolean;
    alambre_puas: boolean;
    piedra: boolean;
    cerco_electrico: boolean;
    cercado_pct: number;
}

interface FenceUppResponse {
    total?: number;
    page?: number;
    per_page?: number;
    last_page?: number;
    data?: FenceUppItem[];
}

@Component({
    selector: 'app-infraestructura',
    templateUrl: './infraestructura.html',
    styleUrls: ['./infraestructura.scss'],
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Infraestructura implements OnInit {
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
    public selectedTipo = '';
    public selectedCondicion = '';
    public estados: OptionItem[] = [];
    public municipios: OptionItem[] = [];
    public tipos: OptionItem[] = [];
    public condiciones: OptionItem[] = [];
    public tiposCerco: OptionItem[] = [];

    public summary: SummaryResponse = { estados: [], inventario: [] };
    public need: NeedResponse = {};
    public fence: FenceResponse = { tipos: [] };
    public uppBreakdown: UppBreakdownResponse = { data: [], page: 1, per_page: 5, last_page: 1 };
    public fenceUpp: FenceUppResponse = { data: [], page: 1, per_page: 5, last_page: 1 };
    public fenceUsage: Record<string, 'todos' | 'si' | 'no'> = {};

    public readonly doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
            legend: { display: false }
        }
    };

    public readonly fenceBarOptions: ChartConfiguration<'bar'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
            x: { beginAtZero: true, stacked: true, ticks: { color: '#697586' }, grid: { color: '#e7ecf1' } },
            y: { stacked: true, ticks: { color: '#697586' }, grid: { display: false } }
        },
        plugins: { legend: { position: 'bottom', labels: { color: '#516173' } } }
    };

    public fenceChartData: ChartData<'doughnut'> = this.emptyDoughnut();
    public fenceBarChartData: ChartData<'bar'> = this.emptyBar();

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
            summary: this.genericService.sendGetParams<SummaryResponse>(paths.infraestructuraResumen, params, true).pipe(catchError(() => of(null))),
            need: this.genericService.sendGetParams<NeedResponse>(paths.infraestructuraNecesidad, params, true).pipe(catchError(() => of(null))),
            fence: this.genericService.sendGetParams<FenceResponse>(paths.infraestructuraCercado, params, true).pipe(catchError(() => of(null))),
            upp: this.genericService.sendGetParams<UppBreakdownResponse>(paths.infraestructuraDesgloseUpp, { ...params, page: this.uppBreakdown.page || 1, per_page: this.uppBreakdown.per_page || 5 }, true).pipe(catchError(() => of(null))),
            fenceUpp: this.genericService.sendGetParams<FenceUppResponse>(paths.infraestructuraCercadoUpp, { ...params, page: this.fenceUpp.page || 1, per_page: this.fenceUpp.per_page || 5 }, true).pipe(catchError(() => of(null)))
        }).pipe(finalize(() => {
            this.loading = false;
            this.cdr.markForCheck();
            this.refreshChartsSoon();
        })).subscribe((response) => {
            if (response.summary) {
                this.summary = response.summary;
            }
            if (response.need) {
                this.need = response.need;
            }
            if (response.fence) {
                this.fence = response.fence;
                this.applyFenceCharts();
                this.ensureFenceUsageOptions();
            }
            if (response.upp) {
                this.uppBreakdown = response.upp;
            }
            if (response.fenceUpp) {
                this.fenceUpp = response.fenceUpp;
            }

            if (!Object.values(response).some(Boolean)) {
                this.errorMessage = 'No fue posible cargar los datos de infraestructura.';
            }
            this.cdr.markForCheck();
        });
    }

    private loadCatalogs(estado = ''): void {
        this.genericService.sendGetParams<CatalogResponse>(paths.infraestructuraCatalogos, estado ? { estado } : {}, true).subscribe({
            next: (response) => {
                this.tipos = response?.tipos || this.tipos;
                this.condiciones = response?.condiciones || this.condiciones;
                this.tiposCerco = response?.tipos_cerco || this.tiposCerco;
                this.estados = response?.estados || this.estados;
                this.municipios = response?.municipios || [];
                this.cdr.markForCheck();
            },
            error: () => this.cdr.markForCheck()
        });
    }

    public onEstadoChange(): void {
        this.selectedMunicipio = '';
        this.municipios = [];
        this.loadCatalogs(this.selectedEstado);
        this.resetPagesAndLoad();
    }

    public onFilterChange(): void {
        this.resetPagesAndLoad();
    }

    public onSearch(): void {
        this.resetPagesAndLoad();
    }

    private resetPagesAndLoad(): void {
        this.uppBreakdown.page = 1;
        this.fenceUpp.page = 1;
        this.loadData();
    }

    private filterParams(): Record<string, string> {
        const params: Record<string, string> = {};
        if (this.selectedEstado) { params['estado'] = this.selectedEstado; }
        if (this.selectedMunicipio) { params['municipio'] = this.selectedMunicipio; }
        if (this.selectedTipo) { params['tipo'] = this.selectedTipo; }
        if (this.selectedCondicion) { params['condicion'] = this.selectedCondicion; }
        if (this.searchQuery.trim()) { params['q'] = this.searchQuery.trim(); }
        return params;
    }

    public exportCsv(): void {
        const options = { params: this.filterParams(), responseType: 'blob' as 'json' };
        this.genericService.sendGetRequestParams<Blob>(paths.infraestructuraExport, options, true).subscribe({
            next: (blob) => {
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = 'infraestructura-rancho.csv';
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
        this.genericService.sendPostRequest(paths.infraestructuraCacheFlush, {}, true).pipe(
            catchError(() => of(null)),
            finalize(() => {
                this.refreshing = false;
                this.loadData();
            })
        ).subscribe();
    }

    public goToUppPage(page: number): void {
        const lastPage = this.uppBreakdown.last_page || 1;
        this.uppBreakdown.page = Math.min(Math.max(page, 1), lastPage);
        this.loadUppBreakdown();
    }

    public goToFencePage(page: number): void {
        const lastPage = this.fenceUpp.last_page || 1;
        this.fenceUpp.page = Math.min(Math.max(page, 1), lastPage);
        this.loadFenceUpp();
    }

    private loadUppBreakdown(): void {
        this.genericService.sendGetParams<UppBreakdownResponse>(paths.infraestructuraDesgloseUpp, {
            ...this.filterParams(), page: this.uppBreakdown.page || 1, per_page: this.uppBreakdown.per_page || 5
        }, true).subscribe({
            next: (response) => { this.uppBreakdown = response; this.cdr.markForCheck(); },
            error: () => this.cdr.markForCheck()
        });
    }

    private loadFenceUpp(): void {
        this.genericService.sendGetParams<FenceUppResponse>(paths.infraestructuraCercadoUpp, {
            ...this.filterParams(), page: this.fenceUpp.page || 1, per_page: this.fenceUpp.per_page || 5
        }, true).subscribe({
            next: (response) => { this.fenceUpp = response; this.cdr.markForCheck(); },
            error: () => this.cdr.markForCheck()
        });
    }

    public setFenceUsage(tipo: string, uso: 'todos' | 'si' | 'no'): void {
        this.fenceUsage[tipo] = uso;
        this.fenceUpp.page = 1;
        const params: Record<string, string | number> = {
            ...this.filterParams(),
            tipo_cerco: tipo,
            uso,
            page: 1,
            per_page: this.fenceUpp.per_page || 5
        };
        this.genericService.sendGetParams<FenceUppResponse>(paths.infraestructuraCercadoUpp, params, true).subscribe({
            next: (response) => { this.fenceUpp = response; this.cdr.markForCheck(); },
            error: () => this.cdr.markForCheck()
        });
    }

    private ensureFenceUsageOptions(): void {
        (this.fence.tipos || []).forEach((item) => {
            if (!this.fenceUsage[item.tipo]) {
                this.fenceUsage[item.tipo] = 'todos';
            }
        });
    }

    private applyFenceCharts(): void {
        const fenced = this.fence.superficie_cercada_ha || 0;
        const unfenced = this.fence.superficie_sin_cercar_ha || 0;
        this.fenceChartData = {
            labels: ['Superficie cercada', 'Superficie sin cercar'],
            datasets: [{ data: [fenced, unfenced], backgroundColor: ['#22685d', '#e1e4e9'], borderWidth: 0 }]
        };
        this.fenceBarChartData = {
            labels: (this.fence.tipos || []).map((item) => item.etiqueta),
            datasets: [
                { label: 'Sí', data: (this.fence.tipos || []).map((item) => item.usan), backgroundColor: '#22685d', borderRadius: 5 },
                { label: 'No', data: (this.fence.tipos || []).map((item) => item.no_usan), backgroundColor: '#dfe2e7', borderRadius: 5 }
            ]
        };
    }

    public status(estado: InfrastructureStatus['clave']): InfrastructureStatus | undefined {
        return (this.summary.estados || []).find((item) => item.clave === estado);
    }

    public statusPercent(estado: InfrastructureStatus['clave']): number {
        const item = this.status(estado);
        return this.summary.total_elementos ? Math.round(((item?.total || 0) / this.summary.total_elementos) * 100) : 0;
    }

    public totalInventory(): number {
        return (this.summary.inventario || []).reduce((total, item) => total + item.total, 0);
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

    public fenceIcon(tipo: string): string {
        return { cerco_vivo: '🌿', alambre_puas: '🛠️', piedra: '🪨', cerco_electrico: '⚡' }[tipo] || '🧱';
    }

    public fenceColor(tipo: string): string {
        return { cerco_vivo: '#22685d', alambre_puas: '#ad8127', piedra: '#999a9d', cerco_electrico: '#a1244e' }[tipo] || '#22685d';
    }

    public conditionClass(value: number): string {
        if (value >= 50) { return 'good'; }
        if (value >= 25) { return 'regular'; }
        return 'bad';
    }

    public fenceUsed(item: FenceUppItem, tipo: string): boolean {
        return Boolean(item[tipo as keyof FenceUppItem]);
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
