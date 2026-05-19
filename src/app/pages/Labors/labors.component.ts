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
} from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { FilterOption, FilterParams, SepomexMunicipalitiesResponse } from '../Dashboard/dashboard.component';

type SummaryKey = 'laborsRegistered' | 'estatesWithLabors' | 'surfaceWithLabors' | 'conservationPractices';
type ChartKey = 'distributionByType' | 'monthlyActivity' | 'conservationAdoption';

interface TrendData {
    direction?: string;
    percentage?: number;
    label?: string;
    previous_value?: number;
}

interface ProgressData {
    value?: number;
    label?: string;
}

interface SummaryResponse {
    value?: number;
    unit?: string;
    label?: string;
    subtitle?: string;
    trend?: TrendData;
    progress?: ProgressData;
}

interface DistributionItem {
    key?: string;
    label: string;
    value?: number;
    percentage?: number;
    color?: string;
}

interface MonthlyActivityItem {
    month: string;
    month_number?: number;
    value?: number;
    percentage?: number;
}

interface ConservationAdoptionItem {
    key?: string;
    label: string;
    adoption_percentage?: number;
}

interface AdoptionDetailItem {
    label: string;
    value: number;
}

interface DistributionResponse {
    title?: string;
    subtitle?: string;
    total?: number;
    items?: DistributionItem[];
}

interface MonthlyActivityResponse {
    title?: string;
    subtitle?: string;
    total?: number;
    items?: MonthlyActivityItem[];
}

interface ConservationAdoptionResponse {
    title?: string;
    subtitle?: string;
    items?: ConservationAdoptionItem[];
}

interface KpiCard {
    key: SummaryKey;
    icon: string;
    label: string;
    value: number | null;
    unit?: string;
    subtitle: string;
    trend?: TrendData;
    progress?: ProgressData;
    loading: boolean;
}

@Component({
    selector: 'app-labors',
    templateUrl: './labors.html',
    styleUrls: ['./labors.scss'],
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Labors implements OnInit {
    private readonly cdr = inject(ChangeDetectorRef);

    @ViewChildren(BaseChartDirective)
    private readonly chartDirectives?: QueryList<BaseChartDirective>;

    protected readonly chartsReady = signal(false);

    public kpiCards: KpiCard[] = [
        {
            key: 'laborsRegistered',
            icon: 'assignment',
            label: 'Labores Registradas',
            value: null,
            subtitle: 'Eventos totales',
            loading: true
        },
        {
            key: 'estatesWithLabors',
            icon: 'agriculture',
            label: 'Predios con Registro',
            value: null,
            subtitle: 'Predios con actividad',
            loading: true
        },
        {
            key: 'surfaceWithLabors',
            icon: 'grass',
            label: 'Superficie con Labores',
            value: null,
            unit: 'ha',
            subtitle: 'Cobertura actual',
            loading: true
        },
        {
            key: 'conservationPractices',
            icon: 'shield',
            label: 'Prácticas de Conservación',
            value: null,
            subtitle: 'Técnicas implementadas',
            loading: true
        }
    ];

    public chartLoading: Record<ChartKey, boolean> = {
        distributionByType: true,
        monthlyActivity: true,
        conservationAdoption: true
    };

    public chartMeta: Record<ChartKey, { title: string; subtitle: string }> = {
        distributionByType: {
            title: 'Distribución de Labores por Tipo',
            subtitle: 'Cantidad de registros por actividad agrícola'
        },
        monthlyActivity: {
            title: 'Actividad Mensual de Labores',
            subtitle: 'Número de labores registradas por mes (2026)'
        },
        conservationAdoption: {
            title: 'Adopción de Prácticas de Conservación de Suelo',
            subtitle: 'Porcentaje de productores que implementan cada técnica'
        }
    };

    public laborTypeData: ChartData<'bar'> = {
        labels: [],
        datasets: [
            {
                data: [],
                label: 'Registros',
                backgroundColor: [],
                borderRadius: 6,
                borderSkipped: false,
            }
        ]
    };

    public laborTypeOptions: ChartConfiguration<'bar'>['options'] = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: { color: '#5b6777' },
                grid: { color: '#e7ecf1' }
            },
            y: {
                ticks: { color: '#5b6777', font: { size: 10 } },
                grid: { display: false }
            }
        }
    };

    public monthlyData: ChartData<'bar'> = {
        labels: [],
        datasets: [{
            data: [],
            label: 'Labores',
            backgroundColor: '#c8962c',
            borderRadius: 4,
            borderSkipped: false,
        }]
    };

    public monthlyOptions: ChartConfiguration<'bar'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                ticks: { color: '#5b6777', font: { size: 10 } },
                grid: { color: '#e7ecf1' }
            },
            y: {
                beginAtZero: true,
                ticks: { color: '#5b6777' },
                grid: { color: '#e7ecf1' }
            }
        }
    };

    public adoptionData: ChartData<'bar'> = {
        labels: [],
        datasets: [{
            data: [],
            label: '% de adopción',
            backgroundColor: '#9cc7bf',
            borderRadius: 6,
            borderSkipped: false,
        }]
    };

    public adoptionOptions: ChartConfiguration<'bar'>['options'] = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                beginAtZero: true,
                max: 100,
                ticks: { color: '#5b6777' },
                grid: { color: '#e7ecf1' }
            },
            y: {
                ticks: { color: '#5b6777', font: { size: 10 } },
                grid: { display: false }
            }
        }
    };

    public adoptionHighlights: ConservationAdoptionItem[] = [];
    public adoptionDetailItems: AdoptionDetailItem[] = [];
    public distributionItems: DistributionItem[] = [];
    public distributionColors: string[] = [];
    public monthlyActivityColumns: MonthlyActivityItem[][] = [[], []];
    public conservationNarrative = 'Cargando adopción de prácticas de conservación.';

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
        this.loadDashboardData();
    }

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

    private loadDashboardData(): void {
        this.loadSummaryCard('laborsRegistered', paths.laborsRegistered);
        this.loadSummaryCard('estatesWithLabors', paths.estatesWithLabors);
        this.loadSummaryCard('surfaceWithLabors', paths.surfaceWithLabors);
        this.loadSummaryCard('conservationPractices', paths.conservationPractices);
        this.loadDistributionByType();
        this.loadMonthlyActivity();
        this.loadConservationAdoption();
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
    }

    private loadSummaryCard(key: SummaryKey, url: string): void {
        this.genericService.sendGetRequest<SummaryResponse>(url, null, true).subscribe({
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
            progress: response.progress,
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

    private loadDistributionByType(): void {
        this.genericService.sendGetRequest<DistributionResponse>(paths.laborsDistributionByType, null, true).subscribe({
            next: (response: DistributionResponse) => {
                this.chartMeta = {
                    ...this.chartMeta,
                    distributionByType: {
                        title: response.title || this.chartMeta.distributionByType.title,
                        subtitle: response.subtitle || this.chartMeta.distributionByType.subtitle
                    }
                };

                const items = response.items || [];
                const fallbackColors = ['#c8962c', '#bf3159', '#e1cb89', '#6fb1a3', '#d56f3a', '#9cc7bf'];

                this.distributionItems = items;
                this.distributionColors = items.map((item, index) => item.color || fallbackColors[index % fallbackColors.length]);

                this.laborTypeData = {
                    labels: items.map((item) => item.label),
                    datasets: [
                        {
                            data: items.map((item) => item.value || 0),
                            label: 'Registros',
                            backgroundColor: this.distributionColors,
                            borderRadius: 6,
                            borderSkipped: false,
                        }
                    ]
                };

                this.finishChartLoading('distributionByType');
                this.refreshChartsSoon();
            },
            error: () => {
                this.finishChartLoading('distributionByType');
            }
        });
    }

    private loadMonthlyActivity(): void {
        this.genericService.sendGetRequest<MonthlyActivityResponse>(paths.laborsMonthlyActivity, null, true).subscribe({
            next: (response: MonthlyActivityResponse) => {
                this.chartMeta = {
                    ...this.chartMeta,
                    monthlyActivity: {
                        title: response.title || this.chartMeta.monthlyActivity.title,
                        subtitle: response.subtitle || this.chartMeta.monthlyActivity.subtitle
                    }
                };

                const items = response.items || [];

                this.monthlyActivityColumns = this.buildMonthlyColumns(items);

                this.monthlyData = {
                    labels: items.map((item) => item.month),
                    datasets: [{
                        data: items.map((item) => item.value || 0),
                        label: 'Labores',
                        backgroundColor: '#c8962c',
                        borderRadius: 4,
                        borderSkipped: false,
                    }]
                };

                this.finishChartLoading('monthlyActivity');
                this.refreshChartsSoon();
            },
            error: () => {
                this.finishChartLoading('monthlyActivity');
            }
        });
    }

    private buildMonthlyColumns(items: MonthlyActivityItem[]): MonthlyActivityItem[][] {
        return [
            items.filter((_, index) => index % 2 === 0),
            items.filter((_, index) => index % 2 === 1)
        ];
    }

    private loadConservationAdoption(): void {
        this.genericService.sendGetRequest<ConservationAdoptionResponse>(paths.laborsConservationAdoption, null, true).subscribe({
            next: (response: ConservationAdoptionResponse) => {
                this.chartMeta = {
                    ...this.chartMeta,
                    conservationAdoption: {
                        title: response.title || this.chartMeta.conservationAdoption.title,
                        subtitle: response.subtitle || this.chartMeta.conservationAdoption.subtitle
                    }
                };

                const items = response.items || [];

                this.adoptionDetailItems = items.map((item) => ({
                    label: item.label,
                    value: item.adoption_percentage || 0
                }));

                this.adoptionData = {
                    labels: items.map((item) => item.label),
                    datasets: [{
                        data: items.map((item) => item.adoption_percentage || 0),
                        label: '% de adopción',
                        backgroundColor: '#256C63',
                        borderRadius: 6,
                        borderSkipped: false,
                    }]
                };

                this.adoptionHighlights = [...items]
                    .sort((left, right) => (right.adoption_percentage || 0) - (left.adoption_percentage || 0))
                    .slice(0, 6);

                this.conservationNarrative = this.buildConservationNarrative(items);

                this.finishChartLoading('conservationAdoption');
                this.refreshChartsSoon();
            },
            error: () => {
                this.conservationNarrative = 'No fue posible cargar la adopción de prácticas de conservación.';
                this.finishChartLoading('conservationAdoption');
            }
        });
    }

    private buildConservationNarrative(items: ConservationAdoptionItem[]): string {
        if (!items.length) {
            return 'No hay datos disponibles de adopción de prácticas de conservación.';
        }

        const rankedItems = [...items].sort((left, right) => (right.adoption_percentage || 0) - (left.adoption_percentage || 0));
        const [topItem, secondItem, thirdItem] = rankedItems;

        const fragments = [
            `${topItem.label} lidera con ${this.formatPercentage(topItem.adoption_percentage)} de adopción.`
        ];

        if (secondItem) {
            fragments.push(`${secondItem.label} alcanza ${this.formatPercentage(secondItem.adoption_percentage)}.`);
        }

        if (thirdItem) {
            fragments.push(`${thirdItem.label} mantiene ${this.formatPercentage(thirdItem.adoption_percentage)} entre productores.`);
        }

        return fragments.join(' ');
    }

    formatMetricValue(value: number | null | undefined, unit?: string): string {
        if (value === null || value === undefined) {
            return '--';
        }

        const formattedValue = new Intl.NumberFormat('es-MX', {
            maximumFractionDigits: Number.isInteger(value) ? 0 : 1
        }).format(value);

        if (unit === '%') {
            return `${formattedValue}%`;
        }

        return unit ? `${formattedValue} ${unit}` : formattedValue;
    }

    formatPercentage(value: number | null | undefined): string {
        return this.formatMetricValue(value, '%');
    }

    getDistributionColor(index: number): string {
        return this.distributionColors[index] || '#c8962c';
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
