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
    label: string;
    cost_per_hectare: { min: number; average: number; max: number; unit: string };
    breakdown: {
        title: string;
        items: { key: string; label: string; value: number; percentage: number }[];
    };
    sale_price: {
        title: string;
        min: number;
        average: number;
        max: number;
        unit: string;
    };
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
    progress?: {
        value: number;
        label: string;
    };
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
import { FilterOption, FilterParams, SepomexMunicipalitiesResponse } from '../Dashboard/dashboard.component';
import { GenericService } from '../../services/generic.service';
import { paths } from '../../../environments/environment.prod';

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
    // Data de las APIs
    public averageYieldData?: AverageYieldResponse;
    public totalCostPerHectareData?: TotalCostPerHectareResponse;
    public grossMarginPerHectareData?: GrossMarginPerHectareResponse;
    public benefitCostRatioData?: BenefitCostRatioResponse;
    public yieldByHumidityData?: YieldByHumidityResponse;
    public topCropsYieldData?: TopCropsYieldResponse;
    public costYieldEvolutionData?: CostYieldEvolutionResponse;
    public analysisTableData?: AnalysisTableResponse;

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
            this.cdr.markForCheck();
        });
    }

    public loadTotalCostPerHectare(): void {
        const params = this.buildQueryParams();
        this.genericService.sendGetParams<TotalCostPerHectareResponse>(
            paths.totalCostPerHectare,
            params, true
        ).subscribe(data => {
            this.totalCostPerHectareData = data;
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

    public loadYieldByHumidity(): void {
        const params = this.buildQueryParams();
        this.genericService.sendGetParams<YieldByHumidityResponse>(
            paths.yieldByHumidity,
            params, true
        ).subscribe(data => this.yieldByHumidityData = data);
    }

    public loadTopCropsYield(): void {
        const params = this.buildQueryParams();
        this.genericService.sendGetParams<TopCropsYieldResponse>(
            paths.topCropsYield,
            params, true
        ).subscribe(data => this.topCropsYieldData = data);
    }

    public loadCostYieldEvolution(): void {
        const params = this.buildQueryParams();
        this.genericService.sendGetParams<CostYieldEvolutionResponse>(
            paths.costYieldEvolution,
            params, true
        ).subscribe(data => this.costYieldEvolutionData = data);
    }

    public loadAnalysisTable(): void {
        const params = this.buildQueryParams();
        this.genericService.sendGetParams<AnalysisTableResponse>(
            paths.analysisTable,
            params, true
        ).subscribe(data => this.analysisTableData = data);
    }

    // Método para cargar todos los datos principales (puedes llamarlo en ngOnInit o al aplicar filtros)
    public loadAllCostDashboardData(): void {
        this.loadAverageYield();
        this.loadTotalCostPerHectare();
        this.loadGrossMarginPerHectare();
        this.loadBenefitCostRatio();
        this.loadYieldByHumidity();
        this.loadTopCropsYield();
        this.loadCostYieldEvolution();
        this.loadAnalysisTable();
    }
    private readonly genericService = inject(GenericService);

    ngOnInit(): void {
        this.loadFilterOptions();
        this.loadAllCostDashboardData();
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
                this.cultivos = (response.crops || []).map((cr: any) => ({ id: cr.id, label: cr.name }));
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
