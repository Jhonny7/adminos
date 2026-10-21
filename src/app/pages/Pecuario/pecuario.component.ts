import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnInit,
    QueryList,
    ViewChildren,
    ViewChild,
    ViewEncapsulation,
    afterNextRender,
    inject,
    signal
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { catchError, forkJoin, finalize, of } from 'rxjs';
import { paths } from '../../../environments/environment.prod';
import { GenericService } from '../../services/generic.service';
import { PdfExportService } from '../../services/pdf-export.service';

type GeoLevel = 'nacional' | 'estado' | 'municipio';
type LivestockMetric = 'cabezas' | 'vientres';

interface FilterOption {
    id: string | number;
    label: string;
}

interface StateResponse {
    states?: Array<{ code: string | number; name: string }>;
}

interface MunicipalityResponse {
    municipalities?: Array<{ code: string | number; name: string }>;
}

interface ResumenResponse {
    kpis?: {
        total_productores?: number;
        total_upp?: number;
        razas_registradas?: number;
        indice_trazabilidad?: number;
    };
    sexo?: Array<{ clave: string; etiqueta: string; total: number }>;
    edad?: Array<{ rango: string; total: number }>;
    indigena?: { si?: number; no?: number; principales?: string[] };
}

interface Ambito {
    nivel?: string;
    clave?: string | null;
    estado?: string;
}

interface CabezasVientresResponse {
    ambito?: Ambito;
    total_cabezas?: number;
    total_vientres?: number;
    por_finalidad?: Array<{
        clave: string;
        etiqueta: string;
        cabezas: number;
        vientres: number;
    }>;
}

interface RazaItem {
    raza: string;
    cabezas: number;
    vientres: number;
}

interface RazasResponse {
    ambito?: Ambito;
    data?: RazaItem[];
}

interface UPPItem {
    clave: string;
    etiqueta: string;
    total: number;
}

interface UPPResponse {
    ambito?: Ambito;
    total?: number;
    desglose?: UPPItem[];
}

interface SimpleDistributionItem {
    clave: string;
    etiqueta: string;
    total: number;
}

interface DistributionResponse {
    ambito?: Ambito;
    data?: SimpleDistributionItem[];
}

interface TrazabilidadResponse {
    ambito?: Ambito;
    guias_emitidas_pct?: number;
    estado?: string;
    detalle?: Array<{ tipo: string; etiqueta: string; total: number }>;
}

interface SanidadResponse {
    ambito?: Ambito;
    indicadores?: Array<{ clave: string; etiqueta: string; valor: number; estado: string }>;
    indice_general?: { valor: number; estado: string };
}

interface PropiedadResponse {
    ambito?: Ambito;
    productores?: { privada: number; comunal: number };
    produccion_ton?: { privada: number; comunal: number };
    cabezas?: { privada: number; comunal: number };
    vientres?: { privada: number; comunal: number };
}

interface OrganismosResponse {
    ambito?: Ambito;
    con_organismo?: number;
    sin_organismo?: number;
    pgn?: {
        productores_con_perfil?: number;
        total_productores?: number;
        pgn_url?: string;
    };
}

interface ComparacionResponse {
    bioparcela?: number;
    pgn?: number;
    coincidencia?: number;
    cobertura_pct?: number;
    sin_registro_pgn?: number;
    corte?: string;
    serie_mensual?: Array<{
        mes: string;
        bioparcela: number;
        pgn: number;
        coincidencia: number;
    }>;
}

interface PropertyMetric {
    key: 'productores' | 'produccion_ton' | 'cabezas' | 'vientres';
    label: string;
    unit?: string;
    values: { privada: number; comunal: number };
}

@Component({
    selector: 'app-pecuario',
    templateUrl: './pecuario.html',
    styleUrls: ['./pecuario.scss'],
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Pecuario implements OnInit {
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly genericService = inject(GenericService);
    private readonly pdfExportService = inject(PdfExportService);
    private readonly route = inject(ActivatedRoute);

    @ViewChildren(BaseChartDirective)
    private readonly chartDirectives?: QueryList<BaseChartDirective>;

    @ViewChild('pdfContent') private readonly pdfContent?: ElementRef<HTMLElement>;

    public exportingPdf = false;

    protected readonly chartsReady = signal(false);

    public loading = true;
    public refreshing = false;
    public errorMessage = '';
    public selectedYear = String(new Date().getFullYear());

    public geoLevel: GeoLevel = 'nacional';
    public selectedEstado = '';
    public selectedMunicipio = '';
    public estados: FilterOption[] = [];
    public municipios: FilterOption[] = [];
    public statesLoading = false;
    public municipalitiesLoading = false;

    public kpis = {
        total_productores: 0,
        total_upp: 0,
        razas_registradas: 0,
        indice_trazabilidad: 0
    };

    public sexo: Array<{ etiqueta: string; total: number }> = [];
    public edad: Array<{ rango: string; total: number }> = [];
    public indigena = { si: 0, no: 0, principales: [] as string[] };

    public cabezasVientres: CabezasVientresResponse = { por_finalidad: [] };
    public selectedLivestockMetric: LivestockMetric = 'cabezas';
    public razas: RazaItem[] = [];
    public upp: UPPResponse = { desglose: [] };
    public tipoPersona: SimpleDistributionItem[] = [];
    public trazabilidad: TrazabilidadResponse = { detalle: [] };
    public sanidad: SanidadResponse = { indicadores: [] };
    public propiedad: PropiedadResponse = {};
    public organismos: OrganismosResponse = {};
    public comparacion: ComparacionResponse = { serie_mensual: [] };

    public propertyMetrics: PropertyMetric[] = [];

    public sexoChartData: ChartData<'doughnut'> = this.emptyDoughnut();
    public edadChartData: ChartData<'bar'> = this.emptyBar();
    public indigenaChartData: ChartData<'doughnut'> = this.emptyDoughnut();
    public cabezasChartData: ChartData<'bar'> = this.emptyBar();
    public razasChartData: ChartData<'bar'> = this.emptyBar();
    public tipoPersonaChartData: ChartData<'doughnut'> = this.emptyDoughnut();
    public propiedadChartData: ChartData<'bar'> = this.emptyBar();
    public organismosChartData: ChartData<'doughnut'> = this.emptyDoughnut();
    public comparacionChartData: ChartData<'bar'> = this.emptyBar();

    public readonly doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        animation: { duration: 350 },
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#516173', boxWidth: 16, padding: 14 }
            }
        }
    };

    public readonly barOptions: ChartConfiguration<'bar'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 350 },
        plugins: { legend: { display: false } },
        scales: {
            x: {
                ticks: { color: '#697586' },
                grid: { color: '#e7ecf1' }
            },
            y: {
                beginAtZero: true,
                ticks: { color: '#697586' },
                grid: { color: '#e7ecf1' }
            }
        }
    };

    public readonly horizontalBarOptions: ChartConfiguration<'bar'>['options'] = {
        ...this.barOptions,
        indexAxis: 'y',
        scales: {
            x: {
                beginAtZero: true,
                ticks: { color: '#697586' },
                grid: { color: '#e7ecf1' }
            },
            y: {
                ticks: { color: '#697586' },
                grid: { display: false }
            }
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
        this.route.data.subscribe((data) => {
            this.selectedYear = data['year'] || this.selectedYear;
        });
        this.loadStates();
        this.loadAllData();
    }

    private loadStates(): void {
        this.statesLoading = true;
        this.genericService.sendGetRequest<StateResponse>(paths.filterEstados, null, true).subscribe({
            next: (response) => {
                this.estados = (response?.states || []).map((state) => ({
                    id: String(state.code).padStart(2, '0'),
                    label: state.name
                }));
                this.statesLoading = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.statesLoading = false;
                this.cdr.markForCheck();
            }
        });
    }

    public onGeoLevelChange(): void {
        this.selectedEstado = '';
        this.selectedMunicipio = '';
        this.municipios = [];
        this.loadAllData();
    }

    public onEstadoChange(): void {
        this.selectedMunicipio = '';
        this.municipios = [];

        if (this.geoLevel === 'municipio' && this.selectedEstado) {
            this.municipalitiesLoading = true;
            const url = `${paths.filterMunicipiosBase}/${this.selectedEstado}/municipalities`;
            this.genericService.sendGetRequest<MunicipalityResponse>(url, null, true).subscribe({
                next: (response) => {
                    this.municipios = (response?.municipalities || []).map((municipality) => ({
                        id: String(municipality.code).padStart(3, '0'),
                        label: municipality.name
                    }));
                    this.municipalitiesLoading = false;
                    this.cdr.markForCheck();
                },
                error: () => {
                    this.municipalitiesLoading = false;
                    this.cdr.markForCheck();
                }
            });
        }

        this.loadAllData();
    }

    public onMunicipioChange(): void {
        this.loadAllData();
    }

    public publicGeoParams(): Record<string, string> {
        return this.geoParams();
    }

    private geoParams(): Record<string, string> {
        if (this.geoLevel === 'estado' && this.selectedEstado) {
            return { nivel: 'estado', estado: this.selectedEstado };
        }

        if (this.geoLevel === 'municipio' && this.selectedEstado && this.selectedMunicipio) {
            return {
                nivel: 'municipio',
                estado: this.selectedEstado,
                municipio: this.selectedMunicipio
            };
        }

        return { nivel: 'nacional' };
    }

    private loadAllData(): void {
        this.loading = true;
        this.errorMessage = '';
        const params = this.geoParams();

        forkJoin({
            resumen: this.genericService.sendGetRequest<ResumenResponse>(paths.pecuarioResumen, null, true).pipe(catchError(() => of(null))),
            cabezasVientres: this.genericService.sendGetParams<CabezasVientresResponse>(paths.pecuarioCabezasVientres, params, true).pipe(catchError(() => of(null))),
            razas: this.genericService.sendGetParams<RazasResponse>(paths.pecuarioRazas, params, true).pipe(catchError(() => of(null))),
            upp: this.genericService.sendGetParams<UPPResponse>(paths.pecuarioUpp, params, true).pipe(catchError(() => of(null))),
            tipoPersona: this.genericService.sendGetParams<DistributionResponse>(paths.pecuarioTipoPersona, params, true).pipe(catchError(() => of(null))),
            trazabilidad: this.genericService.sendGetParams<TrazabilidadResponse>(paths.pecuarioTrazabilidad, params, true).pipe(catchError(() => of(null))),
            sanidad: this.genericService.sendGetParams<SanidadResponse>(paths.pecuarioSanidad, params, true).pipe(catchError(() => of(null))),
            propiedad: this.genericService.sendGetParams<PropiedadResponse>(paths.pecuarioPropiedad, params, true).pipe(catchError(() => of(null))),
            organismos: this.genericService.sendGetParams<OrganismosResponse>(paths.pecuarioOrganismos, params, true).pipe(catchError(() => of(null))),
            comparacion: this.genericService.sendGetParams<ComparacionResponse>(paths.pecuarioComparacionPgn, { anio: this.selectedYear }, true).pipe(catchError(() => of(null)))
        }).pipe(finalize(() => {
            this.loading = false;
            this.cdr.markForCheck();
            this.refreshChartsSoon();
        })).subscribe((response) => {
            if (response.resumen) {
                this.applyResumen(response.resumen);
            }
            if (response.cabezasVientres) {
                this.applyCabezasVientres(response.cabezasVientres);
            }
            if (response.razas) {
                this.razas = response.razas.data || [];
                this.applyRazasChart();
            }
            if (response.upp) {
                this.upp = response.upp;
            }
            if (response.tipoPersona) {
                this.tipoPersona = response.tipoPersona.data || [];
                this.applyTipoPersonaChart();
            }
            if (response.trazabilidad) {
                this.trazabilidad = response.trazabilidad;
            }
            if (response.sanidad) {
                this.sanidad = response.sanidad;
            }
            if (response.propiedad) {
                this.propiedad = response.propiedad;
                this.applyPropiedadChart();
            }
            if (response.organismos) {
                this.organismos = response.organismos;
                this.applyOrganismosChart();
            }
            if (response.comparacion) {
                this.comparacion = response.comparacion;
                this.applyComparacionChart();
            }

            const loaded = Object.values(response).some(Boolean);
            if (!loaded) {
                this.errorMessage = 'No fue posible cargar los datos pecuarios.';
            }
            this.propertyMetrics = this.buildPropertyMetrics();
            this.cdr.markForCheck();
        });
    }

    private applyResumen(response: ResumenResponse): void {
        this.kpis = {
            total_productores: response.kpis?.total_productores || 0,
            total_upp: response.kpis?.total_upp || 0,
            razas_registradas: response.kpis?.razas_registradas || 0,
            indice_trazabilidad: response.kpis?.indice_trazabilidad || 0
        };
        this.sexo = (response.sexo || []).map((item) => ({ etiqueta: item.etiqueta, total: item.total }));
        this.edad = response.edad || [];
        this.indigena = {
            si: response.indigena?.si || 0,
            no: response.indigena?.no || 0,
            principales: response.indigena?.principales || []
        };

        this.sexoChartData = this.doughnutData(
            this.sexo.map((item) => item.etiqueta),
            this.sexo.map((item) => item.total),
            ['#22685d', '#ecd28d']
        );
        this.edadChartData = this.barData(
            this.edad.map((item) => `${item.rango}${item.rango === '<25' ? ' años' : item.rango === '>60' ? ' años' : ''}`),
            [this.edad.map((item) => item.total)],
            ['Productores'],
            ['#22685d']
        );
        this.indigenaChartData = this.doughnutData(
            ['Sí', 'No'],
            [this.indigena.si, this.indigena.no],
            ['#22685d', '#9d9da0']
        );
    }

    private applyCabezasVientres(response: CabezasVientresResponse): void {
        this.cabezasVientres = {
            ...response,
            por_finalidad: response.por_finalidad || []
        };
        const items = this.cabezasVientres.por_finalidad || [];
        this.cabezasChartData = this.barData(
            items.map((item) => item.etiqueta),
            [items.map((item) => this.selectedLivestockMetric === 'cabezas' ? item.cabezas : item.vientres)],
            [this.selectedLivestockMetric === 'cabezas' ? 'Cabezas' : 'Vientres'],
            ['#22685d']
        );
    }

    public changeLivestockMetric(metric: LivestockMetric): void {
        this.selectedLivestockMetric = metric;
        this.applyCabezasVientres(this.cabezasVientres);
        this.cdr.markForCheck();
        this.refreshChartsSoon();
    }

    private applyRazasChart(): void {
        const items = this.razas.slice(0, 12);
        this.razasChartData = this.barData(
            items.map((item) => item.raza),
            [items.map((item) => this.selectedLivestockMetric === 'cabezas' ? item.cabezas : item.vientres)],
            [this.selectedLivestockMetric === 'cabezas' ? 'Cabezas' : 'Vientres'],
            ['#22685d']
        );
    }

    private applyTipoPersonaChart(): void {
        this.tipoPersonaChartData = this.doughnutData(
            this.tipoPersona.map((item) => item.etiqueta),
            this.tipoPersona.map((item) => item.total),
            ['#22685d', '#ad8127']
        );
    }

    private applyPropiedadChart(): void {
        this.propiedadChartData = this.barData(
            ['Productores', 'Prod. (ton)', 'Cabezas', 'Vientres'],
            [
                [this.propiedad.productores?.privada || 0, this.propiedad.produccion_ton?.privada || 0, this.propiedad.cabezas?.privada || 0, this.propiedad.vientres?.privada || 0],
                [this.propiedad.productores?.comunal || 0, this.propiedad.produccion_ton?.comunal || 0, this.propiedad.cabezas?.comunal || 0, this.propiedad.vientres?.comunal || 0]
            ],
            ['Privada', 'Comunal'],
            ['#22685d', '#ad8127']
        );
    }

    private applyOrganismosChart(): void {
        this.organismosChartData = this.doughnutData(
            ['Con organismo ganadero', 'Sin organismo ganadero'],
            [this.organismos.con_organismo || 0, this.organismos.sin_organismo || 0],
            ['#22685d', '#9d9da0']
        );
    }

    private applyComparacionChart(): void {
        const items = this.comparacion.serie_mensual || [];
        this.comparacionChartData = this.barData(
            items.map((item) => this.monthLabel(item.mes)),
            [items.map((item) => item.bioparcela), items.map((item) => item.pgn)],
            ['Bioparcela', 'PGN'],
            ['#22685d', '#ad8127']
        );
    }

    public buildPropertyMetrics(): PropertyMetric[] {
        return [
            {
                key: 'productores',
                label: 'Total Productores',
                values: this.propiedad.productores || { privada: 0, comunal: 0 }
            },
            {
                key: 'produccion_ton',
                label: 'Producción (ton)',
                values: this.propiedad.produccion_ton || { privada: 0, comunal: 0 }
            },
            {
                key: 'cabezas',
                label: 'Cabezas bovinas',
                values: this.propiedad.cabezas || { privada: 0, comunal: 0 }
            },
            {
                key: 'vientres',
                label: 'Vientres',
                values: this.propiedad.vientres || { privada: 0, comunal: 0 }
            }
        ];
    }

    public refreshData(): void {
        this.refreshing = true;
        this.genericService.sendPostRequest(paths.pecuarioCacheFlush, {}, true).pipe(
            catchError(() => of(null)),
            finalize(() => {
                this.refreshing = false;
                this.loadAllData();
            })
        ).subscribe();
    }

    public exportCsv(): void {
        const options = {
            params: this.geoParams(),
            responseType: 'blob' as 'json'
        };

        this.genericService.sendGetRequestParams<Blob>(paths.pecuarioExport, options, true).subscribe({
            next: (blob) => {
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = 'resumen-pecuario.csv';
                anchor.click();
                URL.revokeObjectURL(url);
            },
            error: () => {
                this.errorMessage = 'No fue posible exportar el CSV.';
                this.cdr.markForCheck();
            }
        });
    }

    public exportPdf(): void {
        if (!this.pdfContent || this.exportingPdf) return;
        this.exportingPdf = true;
        this.pdfExportService.exportElement(this.pdfContent.nativeElement, 'resumen-pecuario').finally(() => {
            this.exportingPdf = false;
            this.cdr.markForCheck();
        });
    }

    public formatNumber(value: number | null | undefined): string {
        return new Intl.NumberFormat('es-MX').format(value || 0);
    }

    public percentage(value: number, total: number): number {
        return total ? Math.round((value / total) * 100) : 0;
    }

    public percentageLabel(value: number, total: number): string {
        return `${this.percentage(value, total)}%`;
    }

    public maxRaza(): number {
        return Math.max(...this.razas.map((item) => this.selectedLivestockMetric === 'cabezas' ? item.cabezas : item.vientres), 1);
    }

    public maxUPP(): number {
        return Math.max(...(this.upp.desglose || []).map((item) => item.total), 1);
    }

    public maxTrazabilidad(): number {
        return Math.max(...(this.trazabilidad.detalle || []).map((item) => item.total), 1);
    }

    public maxSanidad(): number {
        return 100;
    }

    public statusLabel(status?: string): string {
        const labels: Record<string, string> = {
            cumpliendo_objetivo: 'Cumpliendo objetivo',
            pendiente_mejorar: 'Pendiente mejorar',
            aceptable: 'Aceptable',
            critico: 'Crítico'
        };
        return labels[status || ''] || status || 'Sin dato';
    }

    public statusClass(status?: string): string {
        return `status-${status || 'unknown'}`;
    }

    public monthLabel(value: string): string {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const index = Number(value.split('-')[1]) - 1;
        return months[index] || value;
    }

    public metricValue(item: RazaItem): number {
        return this.selectedLivestockMetric === 'cabezas' ? item.cabezas : item.vientres;
    }

    public updateRazasChart(): void {
        this.applyRazasChart();
        this.cdr.markForCheck();
        this.refreshChartsSoon();
    }

    private emptyDoughnut(): ChartData<'doughnut'> {
        return { labels: [], datasets: [{ data: [], backgroundColor: [] }] };
    }

    private emptyBar(): ChartData<'bar'> {
        return { labels: [], datasets: [] };
    }

    private doughnutData(labels: string[], values: number[], colors: string[]): ChartData<'doughnut'> {
        return {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 5
            }]
        };
    }

    private barData(labels: string[], values: number[][], datasetLabels: string[], colors: string[]): ChartData<'bar'> {
        return {
            labels,
            datasets: values.map((data, index) => ({
                data,
                label: datasetLabels[index] || '',
                backgroundColor: colors[index] || '#22685d',
                borderRadius: 7,
                borderSkipped: false
            }))
        };
    }

    private refreshChartsSoon(): void {
        if (!this.chartsReady()) {
            return;
        }

        requestAnimationFrame(() => {
            this.chartDirectives?.forEach((directive) => {
                directive.chart?.resize();
                directive.update();
            });
        });
    }
}
