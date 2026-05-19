import { Component, ChangeDetectionStrategy, ViewEncapsulation, OnInit, inject } from '@angular/core';
import { FilterOption, FilterParams } from '../Dashboard/dashboard.component';
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
  private readonly genericService = inject(GenericService);

  ngOnInit(): void {
    this.loadFilterOptions();
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
    // Lógica de filtros futura
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
    // Lógica de limpieza futura
  }
}
