import { GenericService } from './../../services/generic.service';
import { paths } from '../../../environments/environment.prod';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewEncapsulation,
    inject,
    signal
} from '@angular/core';

type SummaryKey = 'surfaceWithPesticides' | 'usagePercentage' | 'producersReporting' | 'toxicologyRecords';
type SectionKey = 'usageByType' | 'toxicologyDistribution' | 'usageByGender' | 'recordsSummary';
type ToxicologyView = 'records' | 'hectares';

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

interface PesticideUsageItem {
    key?: string;
    label: string;
    value?: number;
    unit?: string;
    percentage?: number;
    color?: string;
}

interface UsageByTypeResponse {
    title?: string;
    subtitle?: string;
    total_hectares?: number;
    items?: PesticideUsageItem[];
}

interface ToxicologyDistributionItem {
    key?: string;
    label: string;
    value?: number;
    unit?: string;
    percentage?: number;
    color?: string;
}

interface ToxicologyDistributionGroup {
    label?: string;
    items?: ToxicologyDistributionItem[];
}

interface ToxicologyDistributionResponse {
    title?: string;
    subtitle?: string;
    by_records?: ToxicologyDistributionGroup;
    by_hectares?: ToxicologyDistributionGroup;
}

interface GenderItem {
    key?: string;
    label: string;
    count?: number;
    percentage?: number;
    color?: string;
}

interface UsageByGenderResponse {
    title?: string;
    subtitle?: string;
    total?: number;
    items?: GenderItem[];
}

interface RecordsSummaryItem {
    crop: string;
    pesticide_type: string;
    active_ingredient: string;
    toxicology_category: string;
    toxicology_key: string;
    surface: number;
    unit?: string;
    producer_gender: string;
}

interface RecordsSummaryResponse {
    title?: string;
    subtitle?: string;
    items?: RecordsSummaryItem[];
}

@Component({
    selector: 'app-plaguicidas',
    templateUrl: './plaguicidas.html',
    styleUrls: ['./plaguicidas.scss'],
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Plaguicidas implements OnInit {
    private readonly cdr = inject(ChangeDetectorRef);

    protected readonly selectedToxicologyView = signal<ToxicologyView>('records');

    public readonly genderAxisTicks = [80, 60, 40, 20, 0];

    public kpiCards: KpiCard[] = [
        {
            key: 'surfaceWithPesticides',
            icon: 'layers',
            label: 'Superficie con plaguicidas',
            value: null,
            unit: 'ha',
            subtitle: 'Cobertura agrícola',
            loading: true
        },
        {
            key: 'usagePercentage',
            icon: 'science',
            label: '% Uso respecto al total',
            value: null,
            unit: '%',
            subtitle: 'Índice de adopción',
            loading: true
        },
        {
            key: 'producersReporting',
            icon: 'groups',
            label: 'Productores que reportan uso',
            value: null,
            subtitle: 'Productores activos',
            loading: true
        },
        {
            key: 'toxicologyRecords',
            icon: 'warning_amber',
            label: 'Registros con categoría tox.',
            value: null,
            subtitle: 'Clasificación toxicológica',
            loading: true
        }
    ];

    public loadingBySection: Record<SectionKey, boolean> = {
        usageByType: true,
        toxicologyDistribution: true,
        usageByGender: true,
        recordsSummary: true
    };

    public sectionMeta: Record<SectionKey, { title: string; subtitle: string }> = {
        usageByType: {
            title: 'Uso por tipo de plaguicida',
            subtitle: 'Hectáreas reportadas según tipo de plaguicida aplicado'
        },
        toxicologyDistribution: {
            title: 'Distribución por categoría toxicológica',
            subtitle: 'Comparativa de riesgo según registros y superficie afectada'
        },
        usageByGender: {
            title: 'Uso de plaguicidas por sexo del productor',
            subtitle: 'Distribución de reportes y superficie por género'
        },
        recordsSummary: {
            title: 'Tabla resumen de registros',
            subtitle: 'Detalle por cultivo, plaguicida y categoría toxicológica'
        }
    };

    public usageByTypeItems: PesticideUsageItem[] = [];
    public usageAxisTicks: number[] = [6000, 4500, 3000, 1500, 0];
    public usageAxisMax = 6000;

    public toxicologyByRecordsLabel = '% de registros';
    public toxicologyByHectaresLabel = '% de hectáreas';
    public toxicologyByRecordsItems: ToxicologyDistributionItem[] = [];
    public toxicologyByHectaresItems: ToxicologyDistributionItem[] = [];

    public genderItems: GenderItem[] = [];

    public recordsSummaryItems: RecordsSummaryItem[] = [];

    constructor(
        private genericService: GenericService
    ) {}

    ngOnInit(): void {
        this.loadDashboardData();
    }

    setToxicologyView(view: ToxicologyView): void {
        this.selectedToxicologyView.set(view);
    }

    get currentToxicologyItems(): ToxicologyDistributionItem[] {
        return this.selectedToxicologyView() === 'records'
            ? this.toxicologyByRecordsItems
            : this.toxicologyByHectaresItems;
    }

    private loadDashboardData(): void {
        this.loadSummaryCard('surfaceWithPesticides', paths.pesticidesSurfaceWithPesticides);
        this.loadSummaryCard('usagePercentage', paths.pesticidesUsagePercentage);
        this.loadSummaryCard('producersReporting', paths.pesticidesProducersReporting);
        this.loadSummaryCard('toxicologyRecords', paths.pesticidesToxicologyRecords);
        this.loadUsageByType();
        this.loadToxicologyDistribution();
        this.loadUsageByGender();
        this.loadRecordsSummary();
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

    private finishSectionLoading(key: SectionKey): void {
        this.loadingBySection = {
            ...this.loadingBySection,
            [key]: false
        };

        this.cdr.markForCheck();
    }

    private updateSectionMeta(key: SectionKey, title?: string, subtitle?: string): void {
        this.sectionMeta = {
            ...this.sectionMeta,
            [key]: {
                title: title || this.sectionMeta[key].title,
                subtitle: subtitle || this.sectionMeta[key].subtitle
            }
        };
    }

    private loadUsageByType(): void {
        this.genericService.sendGetRequest<UsageByTypeResponse>(paths.pesticidesUsageByType, null, true).subscribe({
            next: (response: UsageByTypeResponse) => {
                this.updateSectionMeta('usageByType', response.title, response.subtitle);

                const items = response.items || [];
                this.usageByTypeItems = items;

                const maxValue = Math.max(...items.map((item) => item.value || 0), 0);
                this.usageAxisMax = this.getUsageAxisMax(maxValue);
                this.usageAxisTicks = this.buildAxisTicks(this.usageAxisMax, 4);

                this.finishSectionLoading('usageByType');
            },
            error: () => {
                this.finishSectionLoading('usageByType');
            }
        });
    }

    private loadToxicologyDistribution(): void {
        this.genericService.sendGetRequest<ToxicologyDistributionResponse>(paths.pesticidesToxicologyDistribution, null, true).subscribe({
            next: (response: ToxicologyDistributionResponse) => {
                this.updateSectionMeta('toxicologyDistribution', response.title, response.subtitle);
                this.toxicologyByRecordsLabel = response.by_records?.label || this.toxicologyByRecordsLabel;
                this.toxicologyByHectaresLabel = response.by_hectares?.label || this.toxicologyByHectaresLabel;
                this.toxicologyByRecordsItems = response.by_records?.items || [];
                this.toxicologyByHectaresItems = response.by_hectares?.items || [];

                this.finishSectionLoading('toxicologyDistribution');
            },
            error: () => {
                this.finishSectionLoading('toxicologyDistribution');
            }
        });
    }

    private loadUsageByGender(): void {
        this.genericService.sendGetRequest<UsageByGenderResponse>(paths.pesticidesUsageByGender, null, true).subscribe({
            next: (response: UsageByGenderResponse) => {
                this.updateSectionMeta('usageByGender', response.title, response.subtitle);
                this.genderItems = response.items || [];

                this.finishSectionLoading('usageByGender');
            },
            error: () => {
                this.finishSectionLoading('usageByGender');
            }
        });
    }

    private loadRecordsSummary(): void {
        this.genericService.sendGetRequest<RecordsSummaryResponse>(paths.pesticidesRecordsSummary, null, true).subscribe({
            next: (response: RecordsSummaryResponse) => {
                this.updateSectionMeta('recordsSummary', response.title, response.subtitle);
                this.recordsSummaryItems = response.items || [];

                this.finishSectionLoading('recordsSummary');
            },
            error: () => {
                this.finishSectionLoading('recordsSummary');
            }
        });
    }

    private getUsageAxisMax(maxValue: number): number {
        if (maxValue <= 0) {
            return 1000;
        }

        return maxValue >= 1000
            ? Math.ceil(maxValue / 1000) * 1000
            : Math.ceil(maxValue / 100) * 100;
    }

    private buildAxisTicks(maxValue: number, segments: number): number[] {
        const step = maxValue / segments;

        return Array.from({ length: segments + 1 }, (_, index) => Math.round(maxValue - (step * index)));
    }

    getUsageBarHeight(value?: number): number {
        if (!value || !this.usageAxisMax) {
            return 0;
        }

        return (value / this.usageAxisMax) * 100;
    }

    getGenderBarHeight(percentage?: number): number {
        if (!percentage) {
            return 0;
        }

        return (percentage / this.genderAxisTicks[0]) * 100;
    }

    getGenderIcon(item: GenderItem): string {
        return item.key === 'female' ? 'woman_2' : 'man_2';
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

    formatToxicologyMetric(item: ToxicologyDistributionItem): string {
        const metricValue = this.selectedToxicologyView() === 'records'
            ? this.formatMetricValue(item.value, '%')
            : this.formatMetricValue(item.value, item.unit);

        return `${metricValue} (${this.formatPercentage(item.percentage)})`;
    }

    formatSurface(item: RecordsSummaryItem): string {
        return this.formatMetricValue(item.surface, item.unit);
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

    isToxicologyRecordsView(): boolean {
        return this.selectedToxicologyView() === 'records';
    }

    isToxicologyHectaresView(): boolean {
        return this.selectedToxicologyView() === 'hectares';
    }

    isHighRisk(item: RecordsSummaryItem): boolean {
        return item.toxicology_key === 'high_risk';
    }

    isModerateRisk(item: RecordsSummaryItem): boolean {
        return item.toxicology_key === 'moderate_risk';
    }

    isLowRisk(item: RecordsSummaryItem): boolean {
        return item.toxicology_key === 'low_risk';
    }

    isNoRisk(item: RecordsSummaryItem): boolean {
        return item.toxicology_key === 'no_risk';
    }

    downloadRecordsCsv(): void {
        if (!this.recordsSummaryItems.length || typeof window === 'undefined' || typeof document === 'undefined') {
            return;
        }

        const headers = [
            'Cultivo',
            'Tipo plaguicida',
            'Ingrediente activo',
            'Categoria toxicologica',
            'Superficie',
            'Productor'
        ];

        const rows = this.recordsSummaryItems.map((item) => [
            item.crop,
            item.pesticide_type,
            item.active_ingredient,
            item.toxicology_category,
            this.formatSurface(item),
            item.producer_gender
        ]);

        const csvContent = [headers, ...rows]
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'dashboard-plaguicidas.csv';
        anchor.click();
        window.URL.revokeObjectURL(url);
    }
}