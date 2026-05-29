// ================== Tipos de respuesta para APIs de Costos ==================
export interface AverageYieldResponse {
    value: number;
    unit: string;
    label: string;
    crop: string;
    trend?: {
        direction: string;
        percentage: number;
        label: string;
        previous_value: number;
    };
    progress?: {
        value: number;
        label: string;
    };
    historical?: {
        title: string;
        items: { cycle: string; value: number }[];
    };
    by_municipality?: {
        title: string;
        items: { municipality: string; value: number }[];
    };
}

export interface TotalCostPerHectareResponse {
    title: string;
    mode: string;
    selected_value: number;
    label?: string;
    cost_per_hectare: { min: number; average: number; max: number; unit: string };
    total_cost: number;
    total_surface_ha: number;
    breakdown: {
        title: string;
        items: { key?: string; label: string; value: number; percentage: number }[];
    };
    progress?: {
        value: number;
        label: string;
    };
}

export interface SalePriceResponse {
    title: string;
    sale_price: { min: number; average: number; max: number; unit: string };
    estimated_income: {
        value: number;
        unit: string;
        label: string;
        subtitle: string;
    };
    estimated_profit: {
        value: number;
        unit: string;
        label: string;
        subtitle: string;
        margin: number;
    };
    break_even: {
        value: number;
        unit: string;
        label: string;
        subtitle: string;
        current: number;
    };
}

export interface YieldByMunicipalityResponse {
    title: string;
    unit: string;
    items: {
        municipality_code: string;
        municipality: string;
        harvest_ton: number;
        surface_ha: number;
        yield: number;
    }[];
}

export interface GrossMarginPerHectareResponse {
    value: number;
    unit: string;
    label: string;
    subtitle: string;
    trend?: {
        direction: string;
        percentage: number;
        label: string;
        previous_value: number;
    };
    progress?: {
        value: number;
        label: string;
    };
}

export interface BenefitCostRatioResponse {
    value: number;
    label: string;
    subtitle: string;
    progress?: {
        value: number;
        label: string;
    };
}

export interface YieldByHumidityResponse {
    title: string;
    regimens: {
        key: string;
        label: string;
        crops: { label: string; value: number; color: string }[];
    }[];
}

export interface TopCropsYieldResponse {
    title: string;
    unit: string;
    items: { label: string; value: number }[];
}

export interface CostYieldEvolutionResponse {
    title: string;
    series: { key: string; label: string; unit: string; color: string }[];
    items: { cycle: string; cost: number; yield: number }[];
}

export interface AnalysisTableResponse {
    title: string;
    columns: string[];
    items: {
        crop: string;
        municipality: string;
        surface: number;
        production: number;
        yield: number;
        total_cost: number;
        profit: number;
    }[];
}

// ================== Fin de Tipos ==================
import { Component, ChangeDetectionStrategy, ViewEncapsulation, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { FilterOption, FilterParams, SepomexMunicipalitiesResponse } from '../Dashboard/dashboard.component';
import { GenericService } from '../../services/generic.service';
import { paths } from '../../../environments/environment.prod';

type CostViewMode = 'min' | 'average' | 'max';

@Component({
    selector: 'app-returns-costs',
    templateUrl: './returns-costs.html',
    styleUrls: ['./returns-costs.scss'],
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReturnsCosts implements OnInit {
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly genericService = inject(GenericService);

    private readonly costBreakdownColors = ['#B58728', '#00473A', '#6E163C', '#6C9A8B', '#D7A43C', '#2A6B5F', '#9D7F1C', '#D5DCE4'];
    // Data de las APIs
    public averageYieldData?: AverageYieldResponse;
    public totalCostPerHectareData?: TotalCostPerHectareResponse;
    public salePriceData?: SalePriceResponse;
    public yieldByMunicipalityData?: YieldByMunicipalityResponse;
    public grossMarginPerHectareData?: GrossMarginPerHectareResponse;
    public benefitCostRatioData?: BenefitCostRatioResponse;
    public yieldByHumidityData?: YieldByHumidityResponse;
    public topCropsYieldData?: TopCropsYieldResponse;
    public costYieldEvolutionData?: CostYieldEvolutionResponse;
    public analysisTableData?: AnalysisTableResponse;

    public selectedCostView: CostViewMode = 'average';

    public yieldHistoryChartData: ChartData<'line'> = {
        labels: [],
        datasets: [{ data: [], label: 'Rendimiento', borderColor: '#B58728', backgroundColor: 'rgba(181, 135, 40, 0.18)', pointBackgroundColor: '#B58728', pointBorderColor: '#B58728', pointRadius: 4, pointHoverRadius: 5, tension: 0.35, fill: false }]
    };

    public yieldHistoryChartOptions: ChartConfiguration<'line'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                ticks: { color: '#5b6777' },
                grid: { color: '#e7ecf1' }
            },
            y: {
                beginAtZero: true,
                ticks: { color: '#5b6777' },
                grid: { color: '#e7ecf1' }
            }
        }
    };

    public yieldByMunicipalityChartData: ChartData<'bar'> = {
        labels: [],
        datasets: [{ data: [], label: 'Rendimiento', backgroundColor: '#2A6B5F', borderRadius: 6, borderSkipped: false }]
    };

    public yieldByMunicipalityChartOptions: ChartConfiguration<'bar'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                ticks: { color: '#5b6777' },
                grid: { color: '#e7ecf1' }
            },
            y: {
                beginAtZero: true,
                ticks: { color: '#5b6777' },
                grid: { color: '#e7ecf1' }
            }
        }
    };

    public costBreakdownChartData: ChartData<'doughnut'> = {
        labels: [],
        datasets: [{ data: [], backgroundColor: this.costBreakdownColors, borderColor: '#ffffff', borderWidth: 3, hoverOffset: 4 }]
    };

    public costBreakdownChartOptions: ChartConfiguration<'doughnut'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        cutout: '62%',
        plugins: {
            legend: { display: false }
        }
    };

    public yieldByHumidityChartData: ChartData<'bar'> = {
        labels: [],
        datasets: []
    };

    public yieldByHumidityChartOptions: ChartConfiguration<'bar'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#5b6777', boxWidth: 12, padding: 14 }
            }
        },
        scales: {
            x: {
                ticks: { color: '#5b6777' },
                grid: { color: '#e7ecf1' }
            },
            y: {
                beginAtZero: true,
                ticks: { color: '#5b6777' },
                grid: { color: '#e7ecf1' }
            }
        }
    };

    public topCropsYieldChartData: ChartData<'bar'> = {
        labels: [],
        datasets: [{ data: [], label: 'Rendimiento', backgroundColor: '#B58728', borderRadius: 6, borderSkipped: false }]
    };

    public topCropsYieldChartOptions: ChartConfiguration<'bar'>['options'] = {
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
                ticks: { color: '#5b6777' },
                grid: { display: false }
            }
        }
    };

    public costYieldEvolutionChartData: ChartData<'line'> = {
        labels: [],
        datasets: [
            { data: [], label: 'Costo/ha (MXN)', borderColor: '#9B2226', backgroundColor: 'rgba(155, 34, 38, 0.1)', pointBackgroundColor: '#9B2226', yAxisID: 'y', tension: 0.35 },
            { data: [], label: 'Rendimiento (ton/ha)', borderColor: '#B58728', backgroundColor: 'rgba(181, 135, 40, 0.1)', pointBackgroundColor: '#B58728', yAxisID: 'y1', tension: 0.35 }
        ]
    };

    public costYieldEvolutionChartOptions: ChartConfiguration<'line'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#5b6777', boxWidth: 12, padding: 14 }
            }
        },
        scales: {
            x: {
                ticks: { color: '#5b6777' },
                grid: { color: '#e7ecf1' }
            },
            y: {
                type: 'linear',
                position: 'left',
                beginAtZero: true,
                ticks: { color: '#5b6777' },
                grid: { color: '#e7ecf1' },
                title: { display: true, text: 'Costo (MXN/ha)', color: '#5b6777' }
            },
            y1: {
                type: 'linear',
                position: 'right',
                beginAtZero: true,
                ticks: { color: '#5b6777' },
                grid: { drawOnChartArea: false },
                title: { display: true, text: 'Rendimiento (ton/ha)', color: '#5b6777' }
            }
        }
    };

    public get costBreakdownItems(): TotalCostPerHectareResponse['breakdown']['items'] {
        return this.totalCostPerHectareData?.breakdown?.items ?? [];
    }

    public get currentCostPerHectare(): number {
        return this.totalCostPerHectareData?.cost_per_hectare[this.selectedCostView] ?? 0;
    }

    public get currentSalePrice(): number {
        return this.salePriceData?.sale_price[this.selectedCostView] ?? 0;
    }

    public get averageYieldTitle(): string {
        if (!this.averageYieldData) {
            return 'Rendimiento Promedio';
        }

        return `${this.averageYieldData.label} - ${this.averageYieldData.crop}`;
    }

    public get fertilizationPercentage(): number {
        return this.totalCostPerHectareData?.breakdown.items.find((item) => item.key === 'fertilization')?.percentage ?? 0;
    }

    public get laborPercentage(): number {
        return this.totalCostPerHectareData?.breakdown.items.find((item) => item.key === 'labor')?.percentage ?? 0;
    }

    public setSelectedCostView(view: CostViewMode): void {
        this.selectedCostView = view;
        this.loadTotalCostPerHectare();
    }

    public getCostViewLabel(view: CostViewMode): string {
        return view === 'min' ? 'Mínimo' : view === 'max' ? 'Máximo' : 'Promedio';
    }

    public getBreakdownFill(percentage: number): number {
        return Math.min(Math.max(percentage, 0), 100);
    }

    // Construir los query params a partir de los filtros
    private buildQueryParams(): Record<string, string> | null {
        const f = this.filterValues;
        const params: Record<string, string> = {};
        if (f.estado) params['state'] = f.estado;
        if (f.municipio) params['municipality'] = f.municipio;
        if (f.regimen) params['regimen'] = f.regimen;
        if (f.anio) params['year'] = f.anio;
        if (f.ciclo) params['cycle'] = f.ciclo;
        if (f.tipoProductor) params['producer_type'] = f.tipoProductor;
        if (f.cultivo) params['crop'] = f.cultivo;
        return Object.keys(params).length ? params : null;
    }

    // Métodos para cargar la data de cada API
    public loadAverageYield(): void {
        const params = this.buildQueryParams();
        this.genericService.sendGetParams<AverageYieldResponse>(
            paths.averageYield,
            params, true
        ).subscribe(data => {
            this.averageYieldData = data;
            this.updateAverageYieldCharts(data);
            this.cdr.markForCheck();
        });
    }

    public loadTotalCostPerHectare(): void {
        const params = this.buildQueryParams() || {};
        params['mode'] = this.selectedCostView;
        this.genericService.sendGetParams<TotalCostPerHectareResponse>(
            paths.totalCostPerHectare,
            params, true
        ).subscribe(data => {
            this.totalCostPerHectareData = data;
            this.updateCostBreakdownChart(data);
            this.cdr.markForCheck();
        });
    }

    public loadGrossMarginPerHectare(): void {
        const params = this.buildQueryParams();
        this.genericService.sendGetParams<GrossMarginPerHectareResponse>(
            paths.grossMarginPerHectare,
            params, true
        ).subscribe(data => {
            this.grossMarginPerHectareData = data;
            this.cdr.markForCheck();
        });
    }

    public loadBenefitCostRatio(): void {
        const params = this.buildQueryParams();
        this.genericService.sendGetParams<BenefitCostRatioResponse>(
            paths.benefitCostRatio,
            params, true
        ).subscribe(data => {
            this.benefitCostRatioData = data;
            this.cdr.markForCheck();
        });
    }

    public loadSalePrice(): void {
        const params = this.buildQueryParams();
        this.genericService.sendGetParams<SalePriceResponse>(
            paths.salePrice,
            params, true
        ).subscribe(data => {
            this.salePriceData = data;
            this.cdr.markForCheck();
        });
    }

    public loadYieldByMunicipality(): void {
        const params = this.buildQueryParams();
        this.genericService.sendGetParams<YieldByMunicipalityResponse>(
            paths.yieldByMunicipality,
            params, true
        ).subscribe(data => {
            this.yieldByMunicipalityData = data;
            this.updateYieldByMunicipalityChart(data);
            this.cdr.markForCheck();
        });
    }

    public loadYieldByHumidity(): void {
        const params = this.buildQueryParams();
        this.genericService.sendGetParams<YieldByHumidityResponse>(
            paths.yieldByHumidity,
            params, true
        ).subscribe(data => {
            this.yieldByHumidityData = data;
            this.updateYieldByHumidityChart(data);
            this.cdr.markForCheck();
        });
    }

    public loadTopCropsYield(): void {
        const params = this.buildQueryParams();
        this.genericService.sendGetParams<TopCropsYieldResponse>(
            paths.topCropsYield,
            params, true
        ).subscribe(data => {
            this.topCropsYieldData = data;
            this.updateTopCropsYieldChart(data);
            this.cdr.markForCheck();
        });
    }

    public loadCostYieldEvolution(): void {
        const params = this.buildQueryParams();
        this.genericService.sendGetParams<CostYieldEvolutionResponse>(
            paths.costYieldEvolution,
            params, true
        ).subscribe(data => {
            this.costYieldEvolutionData = data;
            this.updateCostYieldEvolutionChart(data);
            this.cdr.markForCheck();
        });
    }

    public loadAnalysisTable(): void {
        const params = this.buildQueryParams();
        this.genericService.sendGetParams<AnalysisTableResponse>(
            paths.analysisTable,
            params, true
        ).subscribe(data => {
            this.analysisTableData = data;
            this.cdr.markForCheck();
        });
    }

    // Método para cargar todos los datos principales (puedes llamarlo en ngOnInit o al aplicar filtros)
    public loadAllCostDashboardData(): void {
        this.loadAverageYield();
        this.loadTotalCostPerHectare();
        this.loadGrossMarginPerHectare();
        this.loadBenefitCostRatio();
        this.loadSalePrice();
        this.loadYieldByMunicipality();
        this.loadYieldByHumidity();
        this.loadTopCropsYield();
        this.loadCostYieldEvolution();
        this.loadAnalysisTable();
    }
    ngOnInit(): void {
        this.loadFilterOptions();
        this.loadAllCostDashboardData();
    }

    private updateAverageYieldCharts(data: AverageYieldResponse): void {
        const historicalItems = data.historical?.items ?? [];

        this.yieldHistoryChartData = {
            labels: historicalItems.map((item) => item.cycle),
            datasets: [{
                data: historicalItems.map((item) => item.value),
                label: data.historical?.title || 'Rendimiento',
                borderColor: '#B58728',
                backgroundColor: 'rgba(181, 135, 40, 0.18)',
                pointBackgroundColor: '#B58728',
                pointBorderColor: '#B58728',
                pointRadius: 4,
                pointHoverRadius: 5,
                tension: 0.35,
                fill: false
            }]
        };

        // Also update municipality chart from average-yield if dedicated endpoint hasn't loaded yet
        const municipalityItems = data.by_municipality?.items ?? [];
        if (municipalityItems.length && !this.yieldByMunicipalityData) {
            this.yieldByMunicipalityChartData = {
                labels: municipalityItems.map((item) => item.municipality),
                datasets: [{
                    data: municipalityItems.map((item) => item.value),
                    label: data.by_municipality?.title || 'Rendimiento por municipio',
                    backgroundColor: '#2A6B5F',
                    borderRadius: 6,
                    borderSkipped: false
                }]
            };
        }
    }

    private updateYieldByMunicipalityChart(data: YieldByMunicipalityResponse): void {
        const items = data.items ?? [];

        this.yieldByMunicipalityChartData = {
            labels: items.map((item) => item.municipality),
            datasets: [{
                data: items.map((item) => item.yield),
                label: data.title || 'Rendimiento por municipio',
                backgroundColor: '#2A6B5F',
                borderRadius: 6,
                borderSkipped: false
            }]
        };
    }

    private updateCostBreakdownChart(data: TotalCostPerHectareResponse): void {
        const items = data.breakdown?.items ?? [];

        this.costBreakdownChartData = {
            labels: items.map((item) => item.label),
            datasets: [{
                data: items.map((item) => item.value),
                backgroundColor: items.map((_, index) => this.costBreakdownColors[index % this.costBreakdownColors.length]),
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverOffset: 4
            }]
        };
    }

    private updateYieldByHumidityChart(data: YieldByHumidityResponse): void {
        const regimens = data.regimens ?? [];
        const cropLabels = Array.from(new Set(regimens.flatMap((regimen) => regimen.crops.map((crop) => crop.label))));

        this.yieldByHumidityChartData = {
            labels: regimens.map((regimen) => regimen.label),
            datasets: cropLabels.map((cropLabel) => {
                const matchingCrop = regimens.find((regimen) => regimen.crops.some((crop) => crop.label === cropLabel))?.crops.find((crop) => crop.label === cropLabel);

                return {
                    label: cropLabel,
                    data: regimens.map((regimen) => regimen.crops.find((crop) => crop.label === cropLabel)?.value ?? 0),
                    backgroundColor: matchingCrop?.color || '#B58728',
                    borderRadius: 6,
                    borderSkipped: false
                };
            })
        };
    }

    private updateTopCropsYieldChart(data: TopCropsYieldResponse): void {
        const items = data.items ?? [];

        this.topCropsYieldChartData = {
            labels: items.map((item) => item.label),
            datasets: [{
                data: items.map((item) => item.value),
                label: data.unit || 'Rendimiento',
                backgroundColor: '#B58728',
                borderRadius: 6,
                borderSkipped: false
            }]
        };
    }

    private updateCostYieldEvolutionChart(data: CostYieldEvolutionResponse): void {
        const labels = data.items?.map((item) => item.cycle) ?? [];
        const costSeries = data.series?.find((serie) => serie.key === 'cost');
        const yieldSeries = data.series?.find((serie) => serie.key === 'yield');

        this.costYieldEvolutionChartData = {
            labels,
            datasets: [
                {
                    data: data.items?.map((item) => item.cost) ?? [],
                    label: costSeries?.label || 'Costo/ha (MXN)',
                    borderColor: costSeries?.color || '#9B2226',
                    backgroundColor: 'rgba(155, 34, 38, 0.1)',
                    pointBackgroundColor: costSeries?.color || '#9B2226',
                    yAxisID: 'y',
                    tension: 0.35
                },
                {
                    data: data.items?.map((item) => item.yield) ?? [],
                    label: yieldSeries?.label || 'Rendimiento (ton/ha)',
                    borderColor: yieldSeries?.color || '#B58728',
                    backgroundColor: 'rgba(181, 135, 40, 0.1)',
                    pointBackgroundColor: yieldSeries?.color || '#B58728',
                    yAxisID: 'y1',
                    tension: 0.35
                }
            ]
        };
    }

    private loadFilterOptions(): void {
        this.loadEstados();
        this.loadCatalogsReturnsCosts();
        this.generateAnios();
    }

    private loadEstados(): void {
        this.filtersLoading = { ...this.filtersLoading, estados: true };
        this.genericService.sendGetRequest<any>(paths.filterEstados, null, true).subscribe({
            next: (response) => {
                this.estados = (response.states || []).map((s: any) => ({ id: s.code, label: s.name }));
                this.filtersLoading = { ...this.filtersLoading, estados: false };
            },
            error: () => {
                this.filtersLoading = { ...this.filtersLoading, estados: false };
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

    private loadCatalogsReturnsCosts(): void {
        this.filtersLoading = {
            ...this.filtersLoading,
            regimenes: true,
            ciclos: true,
            tiposProductor: true,
            cultivos: true
        };
        this.genericService.sendGetRequest<any>(paths.catalogsDashboard, null, true).subscribe({
            next: (response) => {
                this.regimenes = (response.regimens || []).map((r: any) => ({ id: r.id, label: r.name }));
                this.ciclos = (response.cycle || []).map((c: any) => ({ id: c.id, label: c.name }));
                this.tiposProductor = (response.producer_type || []).map((p: any) => ({ id: p.id, label: p.name }));
                this.cultivos = (response.crops || []).map((cr: any) => ({ id: cr.code, label: cr.name }));
                this.filtersLoading = {
                    ...this.filtersLoading,
                    regimenes: false,
                    ciclos: false,
                    tiposProductor: false,
                    cultivos: false
                };
            },
            error: () => {
                this.filtersLoading = {
                    ...this.filtersLoading,
                    regimenes: false,
                    ciclos: false,
                    tiposProductor: false,
                    cultivos: false
                };
            }
        });
    }
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

    applyFilters(): void {
        this.loadAllCostDashboardData();
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
        this.loadAllCostDashboardData();
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
} 
