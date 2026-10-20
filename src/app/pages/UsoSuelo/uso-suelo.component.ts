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

interface OptionItem { clave: string; etiqueta: string; unidad?: string; }
interface CoverageType { clave: string; etiqueta: string; ha: number; pct: number; }
interface CoverageResponse { superficie_total_ha?: number; tipos?: CoverageType[]; }
interface EvolutionType { ha: number; pct: number; }
interface EvolutionPeriod { anio: number; temporada: string; etiqueta: string; superficie_total_ha: number; tipos: Record<string, EvolutionType>; }
interface EvolutionResponse { periodos?: EvolutionPeriod[]; }
interface ClimateKpi { clave: string; etiqueta: string; valor: number; unidad: string; vs_normal_pct?: number; diferencia_vs_normal?: number; estado?: string | null; }
interface ClimateSeries { periodo: string; etiqueta: string; actual: number; normal: number; }
interface ClimateResponse {
    fuente?: string; conectado?: boolean; actualizado_en?: string; region?: string;
    variable?: { clave: string; etiqueta: string; unidad: string };
    periodo?: string; anio?: number; kpis?: ClimateKpi[]; serie?: ClimateSeries[];
}
interface WaterSource { clave: string; etiqueta: string; ranchos: number; pct: number; }
interface WaterResponse { total_ranchos?: number; con_toma_agua?: number; con_toma_agua_pct?: number; fuentes?: WaterSource[]; }
interface GrazingType { clave: string; etiqueta: string; ranchos: number; pct: number; }
interface GrazingSeason { clave: string; etiqueta: string; tipos: GrazingType[]; }
interface GrazingResponse { total_ranchos?: number; epocas?: GrazingSeason[]; }
interface CatalogResponse {
    estados?: OptionItem[]; municipios?: OptionItem[]; temporadas?: OptionItem[]; anios?: number[];
    variables_clima?: OptionItem[]; periodos_clima?: OptionItem[];
}

@Component({
    selector: 'app-uso-suelo',
    templateUrl: './uso-suelo.html',
    styleUrls: ['./uso-suelo.scss'],
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsoSuelo implements OnInit {
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly genericService = inject(GenericService);

    @ViewChildren(BaseChartDirective) private readonly chartDirectives?: QueryList<BaseChartDirective>;
    protected readonly chartsReady = signal(false);

    public loading = true;
    public refreshing = false;
    public errorMessage = '';
    public searchQuery = '';
    public selectedEstado = '';
    public selectedMunicipio = '';
    public selectedSeason = 'primavera';
    public selectedYear = 2025;
    public climateYear = 2026;
    public climateVariable = 'precipitacion';
    public climatePeriod = 'mensual';

    public estados: OptionItem[] = [];
    public municipios: OptionItem[] = [];
    public seasons: OptionItem[] = [
        { clave: 'primavera', etiqueta: 'Primavera' },
        { clave: 'verano', etiqueta: 'Verano' },
        { clave: 'otono', etiqueta: 'Otoño' },
        { clave: 'invierno', etiqueta: 'Invierno' }
    ];
    public years: number[] = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
    public climateVariables: OptionItem[] = [
        { clave: 'precipitacion', etiqueta: 'Precipitación', unidad: 'mm' },
        { clave: 'sequia', etiqueta: 'Sequía', unidad: '% del territorio' },
        { clave: 'temperatura', etiqueta: 'Temperatura', unidad: '°C' },
        { clave: 'escurrimiento', etiqueta: 'Escurrimiento', unidad: 'mm' },
        { clave: 'humedad_etp', etiqueta: 'Humedad / ETP', unidad: '%' }
    ];
    public climatePeriods: OptionItem[] = [
        { clave: 'mensual', etiqueta: 'Mensual' },
        { clave: 'trimestral', etiqueta: 'Trimestral' }
    ];
    public coverage: CoverageResponse = { tipos: [] };
    public evolution: EvolutionResponse = { periodos: [] };
    public climate: ClimateResponse = { kpis: [], serie: [] };
    public water: WaterResponse = { fuentes: [] };
    public grazing: GrazingResponse = { epocas: [] };

    public climateChartData: ChartData<'bar'> = { labels: [], datasets: [] };
    public evolutionChartData: ChartData<'bar'> = { labels: [], datasets: [] };
    public grazingChartData: ChartData<'bar'> = { labels: [], datasets: [] };

    public readonly climateChartOptions: ChartConfiguration<'bar'>['options'] = {
        responsive: true, maintainAspectRatio: false,
        scales: { x: { grid: { color: '#e7ecf1' }, ticks: { color: '#687387' } }, y: { beginAtZero: true, grid: { color: '#e7ecf1' }, ticks: { color: '#687387' } } },
        plugins: { legend: { position: 'bottom', labels: { color: '#516173' } } }
    };
    public readonly evolutionChartOptions: ChartConfiguration<'bar'>['options'] = {
        responsive: true, maintainAspectRatio: false,
        scales: { x: { grid: { color: '#e7ecf1' }, ticks: { color: '#687387' } }, y: { beginAtZero: true, max: 100, grid: { color: '#e7ecf1' }, ticks: { color: '#687387', callback: (value) => `${value}%` } } },
        plugins: { legend: { position: 'bottom', labels: { color: '#516173' } } }
    };
    public readonly grazingChartOptions: ChartConfiguration<'bar'>['options'] = {
        responsive: true, maintainAspectRatio: false,
        scales: { x: { grid: { color: '#e7ecf1' }, ticks: { color: '#687387' } }, y: { beginAtZero: true, max: 60, grid: { color: '#e7ecf1' }, ticks: { color: '#687387' } } },
        plugins: { legend: { position: 'bottom', labels: { color: '#516173' } } }
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
            coverage: this.genericService.sendGetParams<CoverageResponse>(paths.usoSueloCobertura, params, true).pipe(catchError(() => of(null))),
            evolution: this.genericService.sendGetParams<EvolutionResponse>(paths.usoSueloCoberturaEvolucion, params, true).pipe(catchError(() => of(null))),
            climate: this.genericService.sendGetParams<ClimateResponse>(paths.usoSueloClima, this.climateParams(), true).pipe(catchError(() => of(null))),
            water: this.genericService.sendGetParams<WaterResponse>(paths.usoSueloAgua, params, true).pipe(catchError(() => of(null))),
            grazing: this.genericService.sendGetParams<GrazingResponse>(paths.usoSueloPastoreo, params, true).pipe(catchError(() => of(null)))
        }).pipe(finalize(() => {
            this.loading = false;
            this.cdr.markForCheck();
            this.refreshChartsSoon();
        })).subscribe((response) => {
            if (response.coverage) { this.coverage = response.coverage; }
            if (response.evolution) { this.evolution = response.evolution; }
            if (response.climate) { this.climate = response.climate; }
            if (response.water) { this.water = response.water; }
            if (response.grazing) { this.grazing = response.grazing; }
            this.applyCharts();
            if (!Object.values(response).some(Boolean)) { this.errorMessage = 'No fue posible cargar los datos de uso de suelo.'; }
            this.cdr.markForCheck();
        });
    }

    private loadCatalogs(estado = ''): void {
        this.genericService.sendGetParams<CatalogResponse>(paths.usoSueloCatalogos, estado ? { estado } : {}, true).subscribe({
            next: (response) => {
                this.estados = response?.estados || this.estados;
                this.municipios = response?.municipios || [];
                this.seasons = response?.temporadas || this.seasons;
                this.years = response?.anios || this.years;
                this.climateVariables = response?.variables_clima || this.climateVariables;
                this.climatePeriods = response?.periodos_clima || this.climatePeriods;
                this.cdr.markForCheck();
            },
            error: () => this.cdr.markForCheck()
        });
    }

    private filterParams(): Record<string, string | number> {
        const params: Record<string, string | number> = { anio: this.selectedYear, temporada: this.selectedSeason };
        if (this.selectedEstado) { params['estado'] = this.selectedEstado; }
        if (this.selectedMunicipio) { params['municipio'] = this.selectedMunicipio; }
        if (this.searchQuery.trim()) { params['q'] = this.searchQuery.trim(); }
        return params;
    }

    private climateParams(): Record<string, string | number> {
        const params: Record<string, string | number> = { anio: this.climateYear, variable: this.climateVariable, periodo: this.climatePeriod };
        if (this.selectedEstado) { params['estado'] = this.selectedEstado; }
        return params;
    }

    public onEstadoChange(): void {
        this.selectedMunicipio = '';
        this.loadCatalogs(this.selectedEstado);
        this.loadData();
    }

    public onFilterChange(): void { this.loadData(); }
    public onClimateChange(): void { this.loadData(); }

    public refreshClimate(): void {
        this.refreshing = true;
        this.genericService.sendPostRequest(paths.usoSueloClimaSincronizar, {}, true).pipe(
            catchError(() => of(null)),
            finalize(() => { this.refreshing = false; this.loadData(); this.cdr.markForCheck(); })
        ).subscribe();
    }

    public exportCsv(): void {
        const options = { params: this.filterParams(), responseType: 'blob' as 'json' };
        this.genericService.sendGetRequestParams<Blob>(paths.usoSueloExport, options, true).subscribe({
            next: (blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `uso-suelo-${this.selectedYear}-${this.selectedSeason}.csv`;
                link.click();
                URL.revokeObjectURL(url);
            },
            error: () => { this.errorMessage = 'No fue posible exportar el CSV.'; this.cdr.markForCheck(); }
        });
    }

    private applyCharts(): void {
        const series = this.climate.serie || [];
        this.climateChartData = {
            labels: series.map((item) => item.etiqueta),
            datasets: [
                { label: 'Actual', data: series.map((item) => item.actual), backgroundColor: '#22685d', borderRadius: 7 },
                { label: 'Normal histórica', data: series.map((item) => item.normal), backgroundColor: '#ad8127', borderRadius: 7 }
            ]
        };
        const periods = this.evolution.periodos || [];
        this.evolutionChartData = {
            labels: periods.map((item) => item.etiqueta),
            datasets: [
                { label: 'Nativa', data: periods.map((item) => item.tipos?.['nativa']?.pct || 0), backgroundColor: '#1e6358' },
                { label: 'Exótica', data: periods.map((item) => item.tipos?.['exotica']?.pct || 0), backgroundColor: '#cf7436' },
                { label: 'Invasora', data: periods.map((item) => item.tipos?.['invasora']?.pct || 0), backgroundColor: '#a1244e' },
                { label: 'Inducida', data: periods.map((item) => item.tipos?.['inducida']?.pct || 0), backgroundColor: '#4d9d7e' }
            ]
        };
        const seasons = this.grazing.epocas || [];
        this.grazingChartData = {
            labels: seasons.map((season) => season.etiqueta),
            datasets: [
                { label: 'Pastoreo intensivo', data: seasons.map((season) => this.grazingValue(season, 'intensivo')), backgroundColor: '#1e6358' },
                { label: 'Pastoreo continuo', data: seasons.map((season) => this.grazingValue(season, 'continuo')), backgroundColor: '#ad8127' },
                { label: 'Pastoreo alta densidad', data: seasons.map((season) => this.grazingValue(season, 'alta_densidad')), backgroundColor: '#a1244e' }
            ]
        };
    }

    private grazingValue(season: GrazingSeason, clave: string): number {
        return season.tipos.find((item) => item.clave === clave)?.pct || 0;
    }

    private refreshChartsSoon(): void {
        setTimeout(() => this.chartDirectives?.forEach((chart) => chart.update()), 0);
    }

    public climateKpi(clave: string): ClimateKpi | undefined { return (this.climate.kpis || []).find((item) => item.clave === clave); }
    public formatNumber(value: number | undefined): string { return new Intl.NumberFormat('en-US').format(value || 0); }
    public formatDate(value: string | undefined): string { return value ? new Date(value).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }) : 'Sin actualización'; }
    public formatValue(kpi: ClimateKpi | undefined): string { return kpi ? `${this.formatDecimal(kpi.valor)} ${kpi.unidad}` : '—'; }
    public formatDecimal(value: number | undefined): string { return typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : this.formatNumber(value); }
    public coverageIcon(clave: string): string { return clave === 'nativa' ? '🌱' : clave === 'exotica' ? '🌿' : clave === 'invasora' ? '⚠️' : '🌾'; }
    public sourceColor(index: number): string { return ['#22685d', '#ad8127', '#4d9d7e', '#cf7436'][index] || '#a1244e'; }
    public evolutionChange(): number { const periods = this.evolution.periodos || []; if (periods.length < 2) { return 0; } return (periods[periods.length - 1].tipos?.['invasora']?.pct || 0) - (periods[0].tipos?.['invasora']?.pct || 0); }
}
