import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { paths } from '../../../environments/environment.prod';
import { GenericService } from '../../services/generic.service';
import { PdfExportService } from '../../services/pdf-export.service';

interface CatalogItem {
  clave: string;
  etiqueta: string;
}

interface FilterState {
  estado: string | null;
  certificacion: string | null;
  raza: string | null;
  q: string | null;
}

interface Kpi {
  clave: string;
  etiqueta: string;
  valor: number;
  total: number | null;
  unidad: string | null;
  progreso: number;
  detalle: string;
}

interface KpiResponse { kpis?: Kpi[]; filtros?: FilterState; }

interface VaccinationItem {
  enfermedad: string;
  ultima_aplicacion: string | null;
  estado: 'aplicada' | 'pendiente';
  clasificacion_nom: string;
  folio_receta: string | null;
}

interface VaccinationResponse { total?: number; pendientes?: number; items?: VaccinationItem[]; }

interface CertificationItem {
  upp: string;
  rancho: string;
  estado_geografico?: CatalogItem;
  certificacion: CatalogItem;
  fecha: string;
  estatus: CatalogItem;
}

interface CertificationResponse { total?: number; items?: CertificationItem[]; }

interface DiseaseItem {
  upp: string;
  rancho: string;
  enfermedad: string;
  lote: string;
  arete_siniiga: string;
  animal: string;
  raza?: CatalogItem;
  fecha_deteccion: string;
  estatus: CatalogItem;
}

interface DiseaseResponse {
  total?: number;
  items?: DiseaseItem[];
  alerta?: { casos_activos: number; mensaje: string } | null;
}

interface ProtocolResponse {
  control_acceso_limpieza?: {
    acceso_restringido: boolean;
    registro_visitantes: boolean;
    limpieza_diaria_instalaciones_pct: number;
  };
  sanitizacion?: {
    limpieza_calzado_pct: number;
    desinfeccion_vehiculos_pct: number;
    productos_utilizados: string[];
  };
  observaciones?: { ultima_auditoria: string; alerta: string };
}

interface CoverageItem { enfermedad: string; porcentaje: number; nivel: 'alto' | 'medio' | 'bajo'; }
interface CoverageResponse { items?: CoverageItem[]; promedio_nacional?: number; }

interface RecommendationItem {
  clave: string;
  tipo: 'alta' | 'oportunidad' | 'alerta';
  titulo: string;
  texto: string;
}

interface RecommendationResponse { items?: RecommendationItem[]; }

@Component({
  selector: 'app-sanidad-vacunacion',
  templateUrl: './sanidad-vacunacion.html',
  styleUrls: ['./sanidad-vacunacion.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SanidadVacunacion implements OnInit {
  private readonly genericService = inject(GenericService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly pdfExportService = inject(PdfExportService);

  @ViewChild('pdfContent') private readonly pdfContent?: ElementRef<HTMLElement>;

  public loading = true;
  public exportingPdf = false;
  public errorMessage = '';
  public searchQuery = '';
  public selectedEstado = '';
  public selectedCertificacion = '';
  public selectedRaza = '';

  public estados: CatalogItem[] = [];
  public certificaciones: CatalogItem[] = [];
  public razas: CatalogItem[] = [];
  public kpis: Kpi[] = [];
  public vaccination: VaccinationResponse = { items: [] };
  public certifications: CertificationResponse = { items: [] };
  public diseases: DiseaseResponse = { items: [] };
  public protocols: ProtocolResponse = {};
  public coverage: CoverageResponse = { items: [] };
  public recommendations: RecommendationResponse = { items: [] };

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadData();
  }

  public loadData(): void {
    this.loading = true;
    this.errorMessage = '';
    const params = this.filterParams();

    forkJoin({
      resumen: this.genericService.sendGetParams<KpiResponse>(paths.sanidadResumen, params).pipe(catchError(() => of(null))),
      cartilla: this.genericService.sendGetParams<VaccinationResponse>(paths.sanidadCartillaVacunacion, params).pipe(catchError(() => of(null))),
      certificadas: this.genericService.sendGetParams<CertificationResponse>(paths.sanidadUppCertificadas, params).pipe(catchError(() => of(null))),
      enfermedades: this.genericService.sendGetParams<DiseaseResponse>(paths.sanidadEnfermedades, params).pipe(catchError(() => of(null))),
      protocolos: this.genericService.sendGetParams<ProtocolResponse>(paths.sanidadProtocolos, params).pipe(catchError(() => of(null))),
      cobertura: this.genericService.sendGetParams<CoverageResponse>(paths.sanidadCoberturaEnfermedades, params).pipe(catchError(() => of(null))),
      recomendaciones: this.genericService.sendGetParams<RecommendationResponse>(paths.sanidadRecomendaciones, params).pipe(catchError(() => of(null)))
    }).pipe(finalize(() => {
      this.loading = false;
      this.cdr.markForCheck();
    })).subscribe((response) => {
      if (response.resumen) this.kpis = response.resumen.kpis || [];
      if (response.cartilla) this.vaccination = response.cartilla;
      if (response.certificadas) this.certifications = response.certificadas;
      if (response.enfermedades) this.diseases = response.enfermedades;
      if (response.protocolos) this.protocols = response.protocolos;
      if (response.cobertura) this.coverage = response.cobertura;
      if (response.recomendaciones) this.recommendations = response.recomendaciones;

      if (!Object.values(response).some(Boolean)) {
        this.errorMessage = 'No fue posible cargar los datos de sanidad y vacunación.';
      }
      this.cdr.markForCheck();
    });
  }

  private loadCatalogs(): void {
    this.genericService.sendGetRequest<any>(paths.sanidadCatalogos).pipe(catchError(() => of(null))).subscribe((response) => {
      if (!response) return;
      this.estados = response.estados || [];
      this.certificaciones = response.certificaciones || [];
      this.razas = response.razas || [];
      this.cdr.markForCheck();
    });
  }

  public onSearch(): void { this.loadData(); }
  public onFilterChange(): void { this.loadData(); }

  private filterParams(): Record<string, string> {
    const params: Record<string, string> = {};
    if (this.selectedEstado) params['estado'] = this.selectedEstado;
    if (this.selectedCertificacion) params['certificacion'] = this.selectedCertificacion;
    if (this.selectedRaza) params['raza'] = this.selectedRaza;
    if (this.searchQuery.trim()) params['q'] = this.searchQuery.trim();
    return params;
  }

  public exportCsv(): void {
    const options = { params: this.filterParams(), responseType: 'blob' as 'json' };
    this.genericService.sendGetRequestParams<Blob>(paths.sanidadExport, options).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `sanidad-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.csv`;
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
    this.pdfExportService.exportElement(this.pdfContent.nativeElement, 'sanidad-vacunacion').finally(() => {
      this.exportingPdf = false;
      this.cdr.markForCheck();
    });
  }

  public kpiIcon(clave: string): string {
    return { cobertura_vacunacion: '💉', ranchos_certificacion_vigente: '✅', protocolos_sanidad: '🏥', enfermedades_bajo_control: '⚠️' }[clave] || '📊';
  }

  public formatDate(value: string | null | undefined): string {
    return value ? value.split('-').reverse().join('/') : 'Pendiente';
  }

  public statusClass(value: string | undefined): string {
    return value === 'vigente' || value === 'aplicada' || value === 'controlado' ? 'status-green' : value === 'en_proceso' ? 'status-gold' : 'status-red';
  }

  public coverageClass(value: string): string { return `coverage-${value}`; }
  public recommendationIcon(type: string): string { return { alta: '⚠️', oportunidad: '📈', alerta: '🚨' }[type] || '📌'; }

  public protocolValue(value: boolean | undefined): string { return value ? 'Sí ✅' : 'No'; }
  public products(): string { return (this.protocols.sanitizacion?.productos_utilizados || []).join(' / '); }
}
