import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { paths } from '../../../environments/environment';
import { GenericService } from '../../services/generic.service';

interface FilterOption {
    value: string;
    label: string;
}

interface PredioMarker {
    lat: number;
    lng: number;
    nombre: string;
    superficie: number;
    cultivo: string;
    productor: string;
}

type SepomexState = {
    code: number;
    name: string;
};

type SepomexMunicipality = {
    code: number;
    name: string;
};

type SepomexStatesResponse = {
    states: SepomexState[];
};

type SepomexMunicipalitiesResponse = {
    municipalities: SepomexMunicipality[];
};

type CatalogItem = {
    id: number;
    code: string;
    name: string;
};

type CatalogsDashboardResponse = {
    crops: CatalogItem[];
};

type EstatesCatalogItem = {
    id: number;
    code: string;
    name: string;
};

type EstatesCatalogsResponse = {
    water_irrigation_types: EstatesCatalogItem[];
    water_humidities: EstatesCatalogItem[];
    production_systems: EstatesCatalogItem[];
    soil_types: EstatesCatalogItem[];
    danger_levels: EstatesCatalogItem[];
};

type ApiLatLng = {
    lat: number;
    lng: number;
};

type EstateItem = {
    id: number;
    identification: string;
    name: string;
    surface_ha: number;
    state: number;
    municipality: number;
    centroid: ApiLatLng;
    coordinates: ApiLatLng[];
    crops: string[];
};

type EstatesResponse = {
    title: string;
    total: number;
    items: EstateItem[];
};

@Component({
    selector: 'app-predios',
    templateUrl: './predios.html',
    styleUrls: ['./predios.scss'],
    standalone: false,
    encapsulation: ViewEncapsulation.None
})
export class Predios implements OnInit, AfterViewInit, OnDestroy {

    private map: L.Map | null = null;
    private markersLayer: L.LayerGroup = L.layerGroup();

    estados: FilterOption[] = [{ value: '', label: 'Todos' }];
    municipios: FilterOption[] = [{ value: '', label: 'Todos' }];
    localidades: FilterOption[] = [{ value: '', label: 'Todas' }];
    cultivos: FilterOption[] = [{ value: '', label: 'Todos' }];
    anios: FilterOption[] = [{ value: '', label: 'Todos' }];
    ciclos: FilterOption[] = [
        { value: '', label: 'Todos' },
        { value: '1', label: 'Primavera-Verano' },
        { value: '2', label: 'Otoño-Invierno' }
    ];

    selectedEstado = '';
    selectedMunicipio = '';
    selectedLocalidad = '';
    selectedCultivo = '';
    selectedAnio = '2025';
    selectedCiclo = '';

    mecanizacion: FilterOption[] = [{ value: '', label: 'Todos' }];
    tiposRiego: FilterOption[] = [{ value: '', label: 'Todos' }];
    selectedMecanizacion = '';
    selectedTipoRiego = '';

    productionTypes: FilterOption[] = [{ value: '', label: 'Todos' }];
    humidity: FilterOption[] = [{ value: '', label: 'Todos' }];
    soilTypes: FilterOption[] = [{ value: '', label: 'Todos' }];
    dangerLevels: FilterOption[] = [{ value: '', label: 'Todos' }];

    selectedProductionSystem = '';
    selectedWaterHumidity = '';
    selectedSoilType = '';
    selectedDangerLevel = '';

    prediosMecanizacion = 156;
    prediosRiego = 189;

    infraOpen = true;
    procesoOpen = false;
    recursosOpen = false;

    private geofencesLayer: L.LayerGroup = L.layerGroup();

    private estates: EstateItem[] = [];
    private estatesSub?: Subscription;EXQJM8njwHGm4CCZ
    private catalogsSub?: Subscription;
    private estadosSub?: Subscription;
    private municipiosSub?: Subscription;
    private cropsSub?: Subscription;

    private readonly estateColors = [
        '#2D6A4F',
        '#B58728',
        '#7B2D8E',
        '#006480',
        '#9B2226',
        '#3B64C0',
        '#3BB8BE'
    ];

    predios: PredioMarker[] = [
        { lat: 20.63, lng: -103.34, nombre: 'Predio El Roble', superficie: 12.5, cultivo: 'Maíz', productor: 'Juan Pérez' },
        { lat: 20.61, lng: -103.38, nombre: 'Predio La Esperanza', superficie: 8.3, cultivo: 'Frijol', productor: 'María López' },
        { lat: 20.65, lng: -103.30, nombre: 'Predio San Miguel', superficie: 15.0, cultivo: 'Sorgo', productor: 'Carlos Ruiz' },
        { lat: 20.59, lng: -103.42, nombre: 'Predio Los Pinos', superficie: 22.1, cultivo: 'Maíz', productor: 'Ana García' },
        { lat: 20.67, lng: -103.25, nombre: 'Predio El Mezquite', superficie: 6.7, cultivo: 'Chile', productor: 'Pedro Sánchez' },
        { lat: 20.55, lng: -103.35, nombre: 'Predio La Noria', superficie: 18.4, cultivo: 'Tomate', productor: 'Rosa Martínez' },
        { lat: 20.62, lng: -103.28, nombre: 'Predio Santa Cruz', superficie: 10.2, cultivo: 'Maíz', productor: 'Luis Hernández' },
        { lat: 20.58, lng: -103.40, nombre: 'Predio El Potrero', superficie: 30.0, cultivo: 'Agave', productor: 'Jorge Ramírez' }
    ];

    private mapReady = false;

    constructor(
        private cdr: ChangeDetectorRef,
        private genericService: GenericService
    ) {}

    ngOnInit(): void {
        this.generateAnios();
        this.loadEstados();
        this.loadCultivos();
        this.loadEstatesCatalogs();
    }

    ngAfterViewInit(): void {
        setTimeout(() => this.initMap(), 500);
    }

    ngOnDestroy(): void {
        this.estatesSub?.unsubscribe();
        this.catalogsSub?.unsubscribe();
        this.estadosSub?.unsubscribe();
        this.municipiosSub?.unsubscribe();
        this.cropsSub?.unsubscribe();
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
    }

    private initMap(): void {
        const defaultIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        L.Marker.prototype.options.icon = defaultIcon;

        this.map = L.map('predios-map', {
            center: [20.62, -103.34],
            zoom: 12,
            zoomControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(this.map);

        L.control.zoom({ position: 'topright' }).addTo(this.map);

        this.markersLayer.addTo(this.map);
        this.geofencesLayer.addTo(this.map);
        this.mapReady = true;
        this.loadEstates();

        this.map.invalidateSize();
    }

    private loadEstates(params?: Record<string, string> | null): void {
        this.estatesSub?.unsubscribe();
        this.estatesSub = this.genericService
            .sendGetParams<EstatesResponse>(paths.estates, params ?? {}, true)
            .subscribe({
                next: (response) => {
                    this.estates = response?.items ?? [];
                    this.renderEstatesPolygons();
                },
                error: () => {
                    this.estates = [];
                    this.geofencesLayer.clearLayers();
                }
            });
    }

    onEstadoChange(estadoId: string): void {
        this.selectedEstado = estadoId;
        this.selectedMunicipio = '';
        this.municipios = [{ value: '', label: 'Todos' }];

        if (!estadoId) {
            return;
        }

        this.municipiosSub?.unsubscribe();
        const url = `${paths.filterMunicipiosBase}/${estadoId}/municipalities`;
        this.municipiosSub = this.genericService
            .sendGetRequest<SepomexMunicipalitiesResponse>(url, null, true)
            .subscribe({
                next: (response) => {
                    const opts = (response?.municipalities ?? []).map((m) => ({
                        value: String(m.code),
                        label: m.name
                    }));
                    this.municipios = [{ value: '', label: 'Todos' }, ...opts];
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.municipios = [{ value: '', label: 'Todos' }];
                    this.cdr.detectChanges();
                }
            });
    }

    applyFilters(): void {
        const params = this.buildFilterParams();
        this.loadEstates(params);
    }

    clearFilters(): void {
        this.selectedEstado = '';
        this.selectedMunicipio = '';
        this.selectedLocalidad = '';
        this.selectedCultivo = '';
        this.selectedAnio = '';
        this.selectedCiclo = '';

        this.selectedMecanizacion = '';
        this.selectedTipoRiego = '';
        this.selectedProductionSystem = '';
        this.selectedWaterHumidity = '';
        this.selectedSoilType = '';
        this.selectedDangerLevel = '';

        this.municipios = [{ value: '', label: 'Todos' }];
        this.loadEstates(null);
    }

    private buildFilterParams(): Record<string, string> | null {
        const params: Record<string, string> = {};

        if (this.selectedEstado) {
            params['state'] = this.selectedEstado;
        }
        if (this.selectedMunicipio) {
            params['municipality'] = this.selectedMunicipio;
        }
        if (this.selectedCultivo) {
            params['crop'] = this.selectedCultivo;
        }
        if (this.selectedAnio) {
            params['year'] = this.selectedAnio;
        }
        if (this.selectedCiclo) {
            params['cycle'] = this.selectedCiclo;
        }

        // Filtros adicionales (si el backend los soporta)
        if (this.selectedTipoRiego) {
            params['water_irrigation_type'] = this.selectedTipoRiego;
        }
        if (this.selectedWaterHumidity) {
            params['water_humidity'] = this.selectedWaterHumidity;
        }
        if (this.selectedProductionSystem) {
            params['production_system'] = this.selectedProductionSystem;
        }
        if (this.selectedSoilType) {
            params['soil_type'] = this.selectedSoilType;
        }
        if (this.selectedDangerLevel) {
            params['danger_level'] = this.selectedDangerLevel;
        }

        return Object.keys(params).length ? params : null;
    }

    private loadEstados(): void {
        this.estadosSub?.unsubscribe();
        this.estadosSub = this.genericService
            .sendGetRequest<SepomexStatesResponse>(paths.filterEstados, null, true)
            .subscribe({
                next: (response) => {
                    const opts = (response?.states ?? []).map((s) => ({
                        value: String(s.code),
                        label: s.name
                    }));
                    this.estados = [{ value: '', label: 'Todos' }, ...opts];
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.estados = [{ value: '', label: 'Todos' }];
                    this.cdr.detectChanges();
                }
            });
    }

    private loadCultivos(): void {
        this.cropsSub?.unsubscribe();
        this.cropsSub = this.genericService
            .sendGetRequest<CatalogsDashboardResponse>(paths.catalogsDashboard, null, true)
            .subscribe({
                next: (response) => {
                    const opts = (response?.crops ?? []).map((cr) => ({
                        value: cr.code,
                        label: cr.name
                    }));
                    this.cultivos = [{ value: '', label: 'Todos' }, ...opts];
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.cultivos = [{ value: '', label: 'Todos' }];
                    this.cdr.detectChanges();
                }
            });
    }

    private loadEstatesCatalogs(): void {
        this.catalogsSub?.unsubscribe();
        this.catalogsSub = this.genericService
            .sendGetRequest<EstatesCatalogsResponse>(paths.estatesCatalogs, null, true)
            .subscribe({
                next: (response) => {
                    this.tiposRiego = this.mapCatalogToOptions(response?.water_irrigation_types);
                    this.humidity = this.mapCatalogToOptions(response?.water_humidities);
                    this.productionTypes = this.mapCatalogToOptions(response?.production_systems);
                    this.soilTypes = this.mapCatalogToOptions(response?.soil_types);
                    this.dangerLevels = this.mapCatalogToOptions(response?.danger_levels);
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.tiposRiego = [{ value: '', label: 'Todos' }];
                    this.humidity = [{ value: '', label: 'Todos' }];
                    this.productionTypes = [{ value: '', label: 'Todos' }];
                    this.soilTypes = [{ value: '', label: 'Todos' }];
                    this.dangerLevels = [{ value: '', label: 'Todos' }];
                    this.cdr.detectChanges();
                }
            });
    }

    private mapCatalogToOptions(items?: EstatesCatalogItem[]): FilterOption[] {
        const opts = (items ?? []).map((item) => ({
            value: item.code,
            label: item.name
        }));

        return [{ value: '', label: 'Todos' }, ...opts];
    }

    private generateAnios(): void {
        const currentYear = new Date().getFullYear();
        const years: FilterOption[] = [{ value: '', label: 'Todos' }];
        for (let i = 0; i <= 10; i++) {
            const year = String(currentYear - i);
            years.push({ value: year, label: year });
        }
        this.anios = years;
        this.selectedAnio = String(currentYear);
    }

    private renderEstatesPolygons(): void {
        if (!this.mapReady || !this.map) {
            return;
        }

        this.geofencesLayer.clearLayers();

        let bounds: L.LatLngBounds | null = null;

        for (let i = 0; i < this.estates.length; i++) {
            const estate = this.estates[i];
            const coords = (estate.coordinates ?? [])
                .map((pt) => this.toLeafletLatLngTuple(pt))
                .filter((pt): pt is L.LatLngTuple => pt !== null);

            if (coords.length < 3) {
                continue;
            }

            const color = this.estateColors[i % this.estateColors.length];
            const polygon = L.polygon(coords, {
                color,
                weight: 2,
                opacity: 0.9,
                fillColor: color,
                fillOpacity: 0.22
            });

            polygon.bindPopup(`
                <div style="font-family: sans-serif; min-width: 200px;">
                    <strong style="font-size: 0.9rem; color: ${color};">${estate.name ?? 'Predio'}</strong>
                    <hr style="border: none; border-top: 1px solid #eef2f6; margin: 0.4rem 0;">
                    <div style="font-size: 0.78rem; color: #516173; line-height: 1.6;">
                        <div><b>ID:</b> ${estate.identification ?? '-'}</div>
                        <div><b>Superficie:</b> ${estate.surface_ha ?? '-'} ha</div>
                        <div><b>Cultivos:</b> ${(estate.crops ?? []).join(', ') || '-'}</div>
                    </div>
                </div>
            `);

            polygon.addTo(this.geofencesLayer);

            const polygonBounds = polygon.getBounds();
            bounds = bounds ? bounds.extend(polygonBounds) : polygonBounds;
        }

        if (bounds) {
            this.map.fitBounds(bounds.pad(0.08));
        }

        this.cdr.detectChanges();
    }

    private toLeafletLatLngTuple(point: ApiLatLng | null | undefined): L.LatLngTuple | null {
        const a = Number(point?.lat);
        const b = Number(point?.lng);

        if (!Number.isFinite(a) || !Number.isFinite(b)) {
            return null;
        }

        // El API a veces viene como { lat: lng, lng: lat }.
        // Heurística: si "lat" está fuera del rango de latitud, lo interpretamos como longitud.
        if (Math.abs(a) > 90 && Math.abs(b) <= 90) {
            return [b, a];
        }

        return [a, b];
    }

    private loadMarkers(): void {
        this.markersLayer.clearLayers();

        for (const predio of this.predios) {
            const marker = L.circleMarker([predio.lat, predio.lng], {
                radius: Math.max(8, Math.min(predio.superficie / 2, 20)),
                fillColor: '#c8962c',
                color: '#a1784a',
                weight: 2,
                opacity: 0.9,
                fillOpacity: 0.7
            });

            marker.bindPopup(`
                <div style="font-family: sans-serif; min-width: 180px;">
                    <strong style="font-size: 0.9rem; color: #202939;">${predio.nombre}</strong>
                    <hr style="border: none; border-top: 1px solid #eef2f6; margin: 0.4rem 0;">
                    <div style="font-size: 0.78rem; color: #516173; line-height: 1.6;">
                        <div><b>Superficie:</b> ${predio.superficie} ha</div>
                        <div><b>Cultivo:</b> ${predio.cultivo}</div>
                        <div><b>Productor:</b> ${predio.productor}</div>
                    </div>
                </div>
            `);

            marker.addTo(this.markersLayer);
        }
    }

    zoomIn(): void {
        this.map?.zoomIn();
    }

    zoomOut(): void {
        this.map?.zoomOut();
    }

    toggleSection(section: string): void {
        if (section === 'infra') this.infraOpen = !this.infraOpen;
        if (section === 'proceso') this.procesoOpen = !this.procesoOpen;
        if (section === 'recursos') this.recursosOpen = !this.recursosOpen;
    }
}
