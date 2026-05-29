import { GenericService } from './../../services/generic.service';
import { paths } from '../../../environments/environment.prod';
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
} from "@angular/core";
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

type SummaryKey = 'registeredUsers' | 'totalSurface' | 'activeCrops' | 'irrigatedSurface';
type ChartKey = 'surfaceDistribution' | 'usersByGender' | 'topCropsBySurface' | 'topCropsByProduction';

export interface FilterOption {
    id: string | number;
    label: string;
}

interface SepomexState {
    code: number;
    name: string;
}

interface SepomexMunicipality {
    code: number;
    name: string;
}

interface SepomexStatesResponse {
    states: SepomexState[];
}

export interface SepomexMunicipalitiesResponse {
    municipalities: SepomexMunicipality[];
}

interface CatalogItem {
    id: number;
    name: string;
}

interface CatalogsDashboardResponse {
    regimens: CatalogItem[];
    cycle: CatalogItem[];
    producer_type: CatalogItem[];
    crops: CatalogItem[];
}

export interface FilterParams {
    estado?: string;
    municipio?: string;
    regimen?: string;
    anio?: string;
    ciclo?: string;
    tipoProductor?: string;
    cultivo?: string;
}

interface TrendData {
    direction?: string;
    percentage?: number;
    label?: string;
    previous_value?: number;
    previous_count?: number;
}

interface SummaryResponse {
    value?: number;
    unit?: string;
    label?: string;
    subtitle?: string;
    trend?: TrendData;
}

interface DashboardChartItem {
    key?: string;
    label: string;
    value?: number;
    count?: number;
    percentage?: number;
    unit?: string;
    trend?: TrendData;
}

interface DashboardChartResponse {
    title?: string;
    subtitle?: string;
    total?: number;
    total_hectares?: number;
    trend?: TrendData;
    items?: DashboardChartItem[];
}

interface KpiCard {
    key: SummaryKey;
    icon: string;
    label: string;
    value: number | null;
    unit?: string;
    subtitle: string;
    trend?: TrendData;
    loading: boolean;
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.scss'],
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard implements OnInit {
    private readonly cdr = inject(ChangeDetectorRef);

    private readonly surfaceDistributionColors = ['#256C63', '#B58A2A', '#A1244E', '#6C8A3A', '#5E7DA3'];
    private readonly genderColors = ['#256C63', '#B58A2A', '#A1244E'];
    private readonly surfaceCropColor = '#256C63';
    private readonly productionCropColor = '#A1244E';

    @ViewChildren(BaseChartDirective)
    private readonly chartDirectives?: QueryList<BaseChartDirective>;

    protected readonly chartsReady = signal(false);

    // ── Filters ────────────────────────────────────────────────────────────────
    public filterValues: FilterParams = {
        estado: '',
        municipio: '',
        regimen: '',
        anio: '',
        ciclo: '',
        tipoProductor: '',
        cultivo: ''
    };

    public estados: FilterOption[] = [];
    public municipios: FilterOption[] = [];
    public regimenes: FilterOption[] = [];
    public anios: FilterOption[] = [];
    public ciclos: FilterOption[] = [];
    public tiposProductor: FilterOption[] = [];
    public cultivos: FilterOption[] = [];

    public filtersLoading = {
        estados: false,
        municipios: false,
        regimenes: false,
        anios: false,
        ciclos: false,
        tiposProductor: false,
        cultivos: false
    };
    // ───────────────────────────────────────────────────────────────────────────

    public kpiCards: KpiCard[] = [
        {
            key: 'registeredUsers',
            icon: 'groups',
            label: 'Usuarios Registrados',
            value: null,
            subtitle: 'Registrados activos',
            loading: true
        },
        {
            key: 'totalSurface',
            icon: 'grass',
            label: 'Superficie Total',
            value: null,
            unit: 'ha',
            subtitle: 'Hectáreas registradas',
            loading: true
        },
        {
            key: 'activeCrops',
            icon: 'trending_up',
            label: 'Cultivos Activos',
            value: null,
            subtitle: 'Sistemas productivos',
            loading: true
        },
        {
            key: 'irrigatedSurface',
            icon: 'water_drop',
            label: 'Superficie con Riego',
            value: null,
            unit: '%',
            subtitle: 'Cobertura actual de riego',
            loading: true
        }
    ];

    public chartLoading: Record<ChartKey, boolean> = {
        surfaceDistribution: true,
        usersByGender: true,
        topCropsBySurface: true,
        topCropsByProduction: true
    };

    public chartMeta: Record<ChartKey, { title: string; subtitle: string }> = {
        surfaceDistribution: {
            title: 'Distribución de Superficie Agrícola',
            subtitle: 'Hectáreas por tipo de sistema de riego'
        },
        usersByGender: {
            title: 'Usuarios por Sexo',
            subtitle: 'Distribución demográfica de productores'
        },
        topCropsBySurface: {
            title: 'Top 5 Cultivos por Superficie',
            subtitle: 'Hectáreas sembradas por tipo de cultivo'
        },
        topCropsByProduction: {
            title: 'Top 5 Cultivos por Producción',
            subtitle: 'Toneladas cosechadas por cultivo'
        }
    };

    public surfaceDistributionItems: DashboardChartItem[] = [];
    public usersByGenderItems: DashboardChartItem[] = [];
    public topCropsBySurfaceItems: DashboardChartItem[] = [];
    public topCropsByProductionItems: DashboardChartItem[] = [];

    public barChartData: ChartData<'bar'> = {
        labels: ['Masculino', 'Femenino', 'Prefiero no decir'],
        datasets: [
            {
                data: [450, 320, 75],
                label: 'Usuarios',
                backgroundColor: this.genderColors,
                borderColor: '#d9e0e7',
                borderWidth: 1,
                borderRadius: 6,
            }
        ]
    };

    public barChartOptions: ChartConfiguration<'bar'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: { color: '#5b6777' },
                grid: { color: '#e7ecf1' }
            },
            y: {
                ticks: { color: '#5b6777' },
                grid: { color: '#e7ecf1' }
            }
        }
    };

    public pieChartData: ChartData<'doughnut'> = {
        labels: ['Riego', 'Temporal'],
        datasets: [{
            data: [2180, 1670],
            backgroundColor: ['#256C63', '#B58A2A'],
            borderColor: ['#ffffff', '#ffffff'],
            borderWidth: 2,
            hoverOffset: 4
        }]
    };

    public pieChartOptions: ChartConfiguration<'doughnut'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        cutout: '58%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#5b6777',
                    padding: 15,
                    boxWidth: 12
                }
            }
        }
    };

    public lineChartData: ChartData<'bar'> = {
        labels: ['Maíz', 'Frijol', 'Sorgo', 'Trigo', 'Avena'],
        datasets: [
            {
                data: [1250, 850, 620, 480, 350],
                label: 'Hectáreas',
                backgroundColor: this.surfaceCropColor,
                borderRadius: 8,
                borderSkipped: false,
            }
        ]
    };

    public lineChartOptions: ChartConfiguration<'bar'>['options'] = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: { color: '#5b6777' },
                grid: { color: '#e7ecf1' }
            },
            y: {
                ticks: { color: '#5b6777' },
                grid: { display: false }
            }
        }
    };

    public doughnutChartData: ChartData<'bar'> = {
        labels: ['Maíz', 'Frijol', 'Sorgo', 'Trigo', 'Avena'],
        datasets: [{
            data: [5200, 1900, 2800, 1750, 1420],
            label: 'Toneladas',
            backgroundColor: Array.from({ length: 5 }, () => this.productionCropColor),
            borderRadius: 6,
            borderSkipped: false,
        }]
    };

    public doughnutChartOptions: ChartConfiguration<'bar'>['options'] = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: {
                display: false,
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: { color: '#5b6777' },
                grid: { color: '#e7ecf1' }
            },
            y: {
                ticks: { color: '#5b6777' },
                grid: { display: false }
            }
        }
    };

    constructor(
        private genericService: GenericService
    ) {
        afterNextRender(() => {
            this.chartsReady.set(true);
            this.cdr.detectChanges();
            requestAnimationFrame(() => this.refreshCharts());
            setTimeout(() => this.refreshCharts(), 120);
        });
    }

    ngOnInit(): void {
        this.loadFilterOptions();
        this.loadChartData();
    }

    // ── Filter methods ─────────────────────────────────────────────────────────

    private loadFilterOptions(): void {
        this.loadEstados();
        this.loadCatalogsDashboard();
        this.generateAnios();
    }

    private loadEstados(): void {
        this.filtersLoading = { ...this.filtersLoading, estados: true };
        this.genericService.sendGetRequest<SepomexStatesResponse>(paths.filterEstados, null, true).subscribe({
            next: (response) => {
                this.estados = (response.states || []).map((s) => ({ id: s.code, label: s.name }));
                this.filtersLoading = { ...this.filtersLoading, estados: false };
                this.cdr.markForCheck();
            },
            error: () => {
                this.filtersLoading = { ...this.filtersLoading, estados: false };
                this.cdr.markForCheck();
            }
        });
    }

    private generateAnios(): void {
        const currentYear = 2026;
        this.anios = Array.from({ length: 11 }, (_, i) => {
            const year = currentYear - i;
            return { id: String(year), label: String(year) };
        });
    }

    private loadCatalogsDashboard(): void {
        this.filtersLoading = {
            ...this.filtersLoading,
            regimenes: true,
            ciclos: true,
            tiposProductor: true,
            cultivos: true
        };
        this.genericService.sendGetRequest<CatalogsDashboardResponse>(paths.catalogsDashboard, null, true).subscribe({
            next: (response) => {
                this.regimenes = (response.regimens || []).map((r) => ({ id: r.id, label: r.name }));
                this.ciclos = (response.cycle || []).map((c) => ({ id: c.id, label: c.name }));
                this.tiposProductor = (response.producer_type || []).map((p) => ({ id: p.id, label: p.name }));
                this.cultivos = (response.crops || []).map((cr) => ({ id: cr.code, label: cr.name }));
                this.filtersLoading = {
                    ...this.filtersLoading,
                    regimenes: false,
                    ciclos: false,
                    tiposProductor: false,
                    cultivos: false
                };
                this.cdr.markForCheck();
            },
            error: () => {
                this.filtersLoading = {
                    ...this.filtersLoading,
                    regimenes: false,
                    ciclos: false,
                    tiposProductor: false,
                    cultivos: false
                };
                this.cdr.markForCheck();
            }
        });
    }

    private loadFilterList(
        key: keyof typeof this.filtersLoading,
        url: string,
        onSuccess: (list: FilterOption[]) => void
    ): void {
        this.filtersLoading = { ...this.filtersLoading, [key]: true };
        this.genericService.sendGetRequest<FilterOption[]>(url, null, true).subscribe({
            next: (list) => {
                onSuccess(Array.isArray(list) ? list : []);
                this.filtersLoading = { ...this.filtersLoading, [key]: false };
                this.cdr.markForCheck();
            },
            error: () => {
                this.filtersLoading = { ...this.filtersLoading, [key]: false };
                this.cdr.markForCheck();
            }
        });
    }

    onEstadoChange(estadoId: string): void {
        this.filterValues = { ...this.filterValues, estado: estadoId, municipio: '' };
        this.municipios = [];

        if (!estadoId) {
            return;
        }

        this.filtersLoading = { ...this.filtersLoading, municipios: true };
        const url = `${paths.filterMunicipiosBase}/${estadoId}/municipalities`;
        this.genericService.sendGetRequest<SepomexMunicipalitiesResponse>(url, null, true).subscribe({
            next: (response) => {
                this.municipios = (response.municipalities || []).map((m) => ({ id: m.code, label: m.name }));
                this.filtersLoading = { ...this.filtersLoading, municipios: false };
                this.cdr.markForCheck();
            },
            error: () => {
                this.filtersLoading = { ...this.filtersLoading, municipios: false };
                this.cdr.markForCheck();
            }
        });
    }


    applyFilters(): void {
        this.loadChartData(this.filterValues);
    }

    clearFilters(): void {
        this.filterValues = {
            estado: '',
            municipio: '',
            regimen: '',
            anio: '',
            ciclo: '',
            tipoProductor: '',
            cultivo: ''
        };
        this.municipios = [];
        this.loadChartData();
    }

    // ───────────────────────────────────────────────────────────────────────────

    private refreshCharts(): void {
        this.chartDirectives?.forEach((chartDirective) => {
            chartDirective.chart?.resize();
            chartDirective.update();
        });
    }

    private refreshChartsSoon(): void {
        this.cdr.markForCheck();

        if (this.chartsReady()) {
            requestAnimationFrame(() => this.refreshCharts());
        }
    }

    loadChartData(filters?: FilterParams): void {
        const params = this.buildFilterParams(filters);
        this.loadSummaryCard('registeredUsers', paths.registeredUsers, params);
        this.loadSummaryCard('totalSurface', paths.totalSurface, params);
        this.loadSummaryCard('activeCrops', paths.activeCrops, params);
        this.loadSummaryCard('irrigatedSurface', paths.irrigatedSurface, params);
        this.loadSurfaceDistribution(params);
        this.loadUsersByGender(params);
        this.loadTopCropsBySurface(params);
        this.loadTopCropsByProduction(params);
    }

    private buildFilterParams(filters?: FilterParams): Record<string, string> | null {
        if (!filters) {
            return null;
        }
        const params: Record<string, string> = {};
        if (filters.estado) { params['state'] = filters.estado; }
        if (filters.municipio) { params['municipality'] = filters.municipio; }
        if (filters.regimen) { params['regimen'] = filters.regimen; }
        if (filters.anio) { params['year'] = filters.anio; }
        if (filters.ciclo) { params['cycle'] = filters.ciclo; }
        if (filters.tipoProductor) { params['producer_type'] = filters.tipoProductor; }
        if (filters.cultivo) { params['crop'] = filters.cultivo; }
        return Object.keys(params).length ? params : null;
    }

    private loadSummaryCard(key: SummaryKey, url: string, params?: Record<string, string> | null): void {
        this.genericService.sendGetParams<SummaryResponse>(url, params ?? {}, true).subscribe({
            next: (response: SummaryResponse) => {
                this.updateKpiCard(key, response);
            },
            error: () => {
                this.finishKpiLoading(key);
            }
        });
    }

    private updateKpiCard(key: SummaryKey, response: SummaryResponse): void {
        const cardIndex = this.kpiCards.findIndex((card) => card.key === key);

        if (cardIndex === -1) {
            return;
        }

        const currentCard = this.kpiCards[cardIndex];
        this.kpiCards[cardIndex] = {
            ...currentCard,
            label: response.label || currentCard.label,
            value: typeof response.value === 'number' ? response.value : currentCard.value,
            unit: response.unit || currentCard.unit,
            subtitle: response.subtitle || currentCard.subtitle,
            trend: response.trend,
            loading: false
        };

        this.cdr.markForCheck();
    }

    private finishKpiLoading(key: SummaryKey): void {
        const cardIndex = this.kpiCards.findIndex((card) => card.key === key);

        if (cardIndex === -1) {
            return;
        }

        this.kpiCards[cardIndex] = {
            ...this.kpiCards[cardIndex],
            loading: false
        };

        this.cdr.markForCheck();
    }

    private finishChartLoading(key: ChartKey): void {
        this.chartLoading = {
            ...this.chartLoading,
            [key]: false
        };

        this.cdr.markForCheck();
    }

    private updateChartMeta(key: ChartKey, response: DashboardChartResponse): void {
        this.chartMeta = {
            ...this.chartMeta,
            [key]: {
                title: response.title || this.chartMeta[key].title,
                subtitle: response.subtitle || this.chartMeta[key].subtitle
            }
        };
    }

    private loadSurfaceDistribution(params?: Record<string, string> | null): void {
        this.genericService.sendGetParams<DashboardChartResponse>(paths.surfaceDistribution, params ?? {}, true).subscribe({
            next: (response: DashboardChartResponse) => {
                this.updateChartMeta('surfaceDistribution', response);

                const items = response.items || [];
                const colors = this.surfaceDistributionColors;

                this.surfaceDistributionItems = items;

                this.pieChartData = {
                    labels: items.map((item) => item.label),
                    datasets: [{
                        data: items.map((item) => item.value || 0),
                        backgroundColor: colors.slice(0, items.length),
                        borderColor: Array.from({ length: items.length }, () => '#ffffff'),
                        borderWidth: 2,
                        hoverOffset: 4
                    }]
                };

                this.finishChartLoading('surfaceDistribution');
                this.refreshChartsSoon();
            },
            error: () => {
                this.finishChartLoading('surfaceDistribution');
            }
        });
    }

    private loadUsersByGender(params?: Record<string, string> | null): void {
        this.genericService.sendGetParams<DashboardChartResponse>(paths.usersByGender, params ?? {}, true).subscribe({
            next: (response: DashboardChartResponse) => {
                this.updateChartMeta('usersByGender', response);

                const items = response.items || [];
                const colors = this.genderColors;

                this.usersByGenderItems = items;

                this.barChartData = {
                    labels: items.map((item) => item.label),
                    datasets: [
                        {
                            data: items.map((item) => item.count || 0),
                            label: 'Usuarios',
                            backgroundColor: colors.slice(0, items.length),
                            borderColor: '#d9e0e7',
                            borderWidth: 1,
                            borderRadius: 6,
                        }
                    ]
                };

                this.finishChartLoading('usersByGender');
                this.refreshChartsSoon();
            },
            error: () => {
                this.finishChartLoading('usersByGender');
            }
        });
    }

    private loadTopCropsBySurface(params?: Record<string, string> | null): void {
        this.genericService.sendGetParams<DashboardChartResponse>(paths.topCropsBySurface, params ?? {}, true).subscribe({
            next: (response: DashboardChartResponse) => {
                this.updateChartMeta('topCropsBySurface', response);

                const items = response.items || [];

                this.topCropsBySurfaceItems = items;

                this.lineChartData = {
                    labels: items.map((item) => item.label),
                    datasets: [
                        {
                            data: items.map((item) => item.value || 0),
                            label: 'Hectáreas',
                            backgroundColor: this.surfaceCropColor,
                            borderRadius: 8,
                            borderSkipped: false,
                        }
                    ]
                };

                this.finishChartLoading('topCropsBySurface');
                this.refreshChartsSoon();
            },
            error: () => {
                this.finishChartLoading('topCropsBySurface');
            }
        });
    }

    private loadTopCropsByProduction(params?: Record<string, string> | null): void {
        this.genericService.sendGetParams<DashboardChartResponse>(paths.topCropsByProduction, params ?? {}, true).subscribe({
            next: (response: DashboardChartResponse) => {
                this.updateChartMeta('topCropsByProduction', response);

                const items = response.items || [];

                this.topCropsByProductionItems = items;

                this.doughnutChartData = {
                    labels: items.map((item) => item.label),
                    datasets: [{
                        data: items.map((item) => item.value || 0),
                        label: 'Toneladas',
                        backgroundColor: Array.from({ length: items.length }, () => this.productionCropColor),
                        borderRadius: 6,
                        borderSkipped: false,
                    }]
                };

                this.finishChartLoading('topCropsByProduction');
                this.refreshChartsSoon();
            },
            error: () => {
                this.finishChartLoading('topCropsByProduction');
            }
        });
    }

    formatMetricValue(value: number | null | undefined, unit?: string): string {
        if (value === null || value === undefined) {
            return '--';
        }

        const formattedValue = new Intl.NumberFormat('es-MX', {
            maximumFractionDigits: Number.isInteger(value) ? 0 : 1
        }).format(value);

        return unit ? `${formattedValue} ${unit}` : formattedValue;
    }

    formatPercentage(value: number | null | undefined): string {
        return `${new Intl.NumberFormat('es-MX', {
            maximumFractionDigits: Number.isInteger(value || 0) ? 0 : 1
        }).format(value || 0)}%`;
    }

    formatChartMetric(item: DashboardChartItem): string {
        return this.formatMetricValue(item.value ?? item.count, item.unit);
    }

    getChartColor(key: ChartKey, index: number): string {
        if (key === 'surfaceDistribution') {
            return this.surfaceDistributionColors[index] || this.surfaceCropColor;
        }

        if (key === 'usersByGender') {
            return this.genderColors[index] || this.surfaceCropColor;
        }

        if (key === 'topCropsByProduction') {
            return this.productionCropColor;
        }

        return this.surfaceCropColor;
    }

    getTrendLabel(trend?: TrendData): string {
        if (trend?.percentage === undefined || trend?.percentage === null) {
            return 'Sin cambios';
        }

        const symbol = this.isTrendDown(trend) ? '↓' : '↑';
        const formatted = new Intl.NumberFormat('es-MX', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 1
        }).format(Math.abs(trend.percentage));

        return `${symbol} ${formatted}% ${trend.label || ''}`.trim();
    }

    isTrendDown(trend?: TrendData): boolean {
        return trend?.direction === 'down' || (trend?.percentage || 0) < 0;
    }
}
