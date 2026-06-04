import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import * as L from 'leaflet';
import { GenericService } from '../../services/generic.service';
import { AlertService } from '../../services/alert.service';
import { paths } from '../../../environments/environment.prod';

interface FilterOption {
    value: string;
    label: string;
}

interface PredioMarker {
    id: number;
    name: string;
    identification: string;
    surface_ha: number;
    crops: string[];
    centroid: { lat: number; lng: number };
    coordinates: { lat: number; lng: number }[];
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
    cultivos: FilterOption[] = [{ value: '', label: 'Todos' }];
    anios: FilterOption[] = [
        { value: '2030', label: '2030' },
        { value: '2029', label: '2029' },
        { value: '2028', label: '2028' },
        { value: '2027', label: '2027' },
        { value: '2026', label: '2026' },
        { value: '2025', label: '2025' },
        { value: '2024', label: '2024' },
        { value: '2023', label: '2023' },
        { value: '2022', label: '2022' },
        { value: '2021', label: '2021' },
        { value: '2020', label: '2020' }
    ];
    ciclos: FilterOption[] = [
        { value: '', label: 'Todos' },
        { value: '1', label: 'Primavera-Verano' },
        { value: '2', label: 'Otoño-Invierno' }
    ];

    selectedEstado = '';
    selectedMunicipio = '';
    selectedCultivo = '';
    selectedAnio = '2025';
    selectedCiclo = '';

    mecanizacion: FilterOption[] = [{ value: '', label: 'Todos' }];
    tiposRiego: FilterOption[] = [{ value: '', label: 'Todos' }];
    modalidadesProduccion: FilterOption[] = [{ value: '', label: 'Todos' }];
    regimenHidrico: FilterOption[] = [{ value: '', label: 'Todos' }];
    tiposSuelo: FilterOption[] = [{ value: '', label: 'Todos' }];
    nivelesPeligrosidad: FilterOption[] = [{ value: '', label: 'Todos' }];
    selectedMecanizacion = '';
    selectedTipoRiego = '';
    selectedModalidadProduccion = '';
    selectedRegimenHidrico = '';
    selectedTipoSuelo = '';
    selectedNivelPeligrosidad = '';

    infraOpen = true;
    procesoOpen = false;
    recursosOpen = false;

    predios: PredioMarker[] = [];

    private mapReady = false;

    constructor(
        private cdr: ChangeDetectorRef,
        private genericService: GenericService,
        private alertService: AlertService
    ) {}

    ngOnInit(): void {
        this.loadEstados();
        this.loadEstatesCatalogs();
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.initMap();
            setTimeout(() => this.map?.invalidateSize(), 300);
        }, 800);
    }

    ngOnDestroy(): void {
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
        this.loadMarkers();

        this.map.invalidateSize();
        this.mapReady = true;
    }

    private loadMarkers(): void {
        this.markersLayer.clearLayers();

        for (const predio of this.predios) {
            // Note: API returns lat/lng swapped (lat = longitude, lng = latitude)
            const centerLat = predio.centroid.lng;
            const centerLng = predio.centroid.lat;

            // Draw polygon if coordinates exist
            if (predio.coordinates && predio.coordinates.length > 2) {
                const polygonCoords: L.LatLngExpression[] = predio.coordinates.map(
                    (coord) => [coord.lng, coord.lat] as L.LatLngExpression
                );

                const polygon = L.polygon(polygonCoords, {
                    color: '#2D6A4F',
                    weight: 2,
                    opacity: 0.8,
                    fillColor: '#2D6A4F',
                    fillOpacity: 0.2
                });

                polygon.bindPopup(this.buildPopup(predio));
                polygon.addTo(this.markersLayer);
            }

            // Draw circle marker at centroid
            if (centerLat && centerLng) {
                const marker = L.circleMarker([centerLat, centerLng], {
                    radius: 6,
                    fillColor: '#c8962c',
                    color: '#a1784a',
                    weight: 2,
                    opacity: 0.9,
                    fillOpacity: 0.9
                });

                marker.bindPopup(this.buildPopup(predio));
                marker.addTo(this.markersLayer);
            }
        }
    }

    private buildPopup(predio: PredioMarker): string {
        return `
            <div style="font-family: sans-serif; min-width: 200px;">
                <strong style="font-size: 0.9rem; color: #202939;">${predio.name}</strong>
                <div style="font-size: 0.7rem; color: #8b9199; margin-top: 2px;">${predio.identification}</div>
                <hr style="border: none; border-top: 1px solid #eef2f6; margin: 0.4rem 0;">
                <div style="font-size: 0.78rem; color: #516173; line-height: 1.6;">
                    <div><b>Superficie:</b> ${predio.surface_ha.toFixed(2)} ha</div>
                    <div><b>Cultivos:</b> ${predio.crops.join(', ') || 'N/A'}</div>
                </div>
            </div>
        `;
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

    exportGeoJSON(): void {
        if (!this.predios.length) return;

        const features = this.predios.map((predio) => {
            // API returns lat/lng swapped: lat = longitude, lng = latitude
            const coordinates = predio.coordinates.map(
                (coord) => [coord.lat, coord.lng]
            );

            // Close the polygon ring if not already closed
            if (coordinates.length > 0) {
                const first = coordinates[0];
                const last = coordinates[coordinates.length - 1];
                if (first[0] !== last[0] || first[1] !== last[1]) {
                    coordinates.push([...first]);
                }
            }

            return {
                type: 'Feature' as const,
                properties: {
                    id: predio.id,
                    name: predio.name,
                    identification: predio.identification,
                    surface_ha: predio.surface_ha,
                    crops: predio.crops
                },
                geometry: {
                    type: 'Polygon' as const,
                    coordinates: [coordinates]
                }
            };
        });

        const geojson = {
            type: 'FeatureCollection' as const,
            features
        };

        const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'predios.geojson';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    applyFilters(): void {
        this.loadEstatesData();
    }

    canApplyMainFilters(): boolean {
        return !!(this.selectedEstado && this.selectedAnio && this.selectedCiclo);
    }

    applyMainFilters(): void {
        if (!this.canApplyMainFilters()) return;
        this.loadEstatesData();
    }

    applyCustomFilters(): void {
        this.loadEstatesData();
    }

    clearFilters(): void {
        this.selectedEstado = '';
        this.selectedMunicipio = '';
        this.selectedCultivo = '';
        this.selectedAnio = '';
        this.selectedCiclo = '';
        this.selectedMecanizacion = '';
        this.selectedTipoRiego = '';
        this.selectedModalidadProduccion = '';
        this.selectedRegimenHidrico = '';
        this.selectedTipoSuelo = '';
        this.selectedNivelPeligrosidad = '';
        this.municipios = [{ value: '', label: 'Todos' }];
        this.predios = [];
        this.loadMarkers();
    }

    private buildQueryParams(): Record<string, string> {
        const params: Record<string, string> = {};
        if (this.selectedEstado) params['state'] = this.selectedEstado;
        if (this.selectedMunicipio) params['municipality'] = this.selectedMunicipio;
        if (this.selectedCultivo) params['crop'] = this.selectedCultivo;
        if (this.selectedAnio) params['year'] = this.selectedAnio;
        if (this.selectedCiclo) params['cycle'] = this.selectedCiclo;
        if (this.selectedMecanizacion) params['mechanization'] = this.selectedMecanizacion;
        if (this.selectedTipoRiego) params['water_irrigation_type'] = this.selectedTipoRiego;
        if (this.selectedModalidadProduccion) params['production_modality'] = this.selectedModalidadProduccion;
        if (this.selectedRegimenHidrico) params['water_humidity'] = this.selectedRegimenHidrico;
        if (this.selectedTipoSuelo) params['soil_type'] = this.selectedTipoSuelo;
        if (this.selectedNivelPeligrosidad) params['danger_level'] = this.selectedNivelPeligrosidad;
        return params;
    }

    private loadEstatesData(): void {
        const params = this.buildQueryParams();
        this.genericService.sendGetParams<any>(paths.estatesList, params, true).subscribe({
            next: (response: any) => {
                const items = response.items || [];

                if (items.length === 0) {
                    this.alertService.warnAlert(
                        'Sin resultados',
                        'No se encontraron predios con los filtros seleccionados. Intenta con otra combinación.'
                    );
                    this.predios = [];
                    this.loadMarkers();
                    this.cdr.detectChanges();
                    return;
                }

                this.predios = items.map((estate: any) => ({
                    id: estate.id,
                    name: estate.name || 'Predio',
                    identification: estate.identification || '',
                    surface_ha: estate.surface_ha || 0,
                    crops: estate.crops || [],
                    centroid: estate.centroid || { lat: 0, lng: 0 },
                    coordinates: estate.coordinates || []
                }));

                if (this.mapReady) {
                    this.loadMarkers();
                    this.fitMapToPredios();
                } else {
                    // Wait for map to be ready then render
                    const waitForMap = setInterval(() => {
                        if (this.mapReady) {
                            clearInterval(waitForMap);
                            this.loadMarkers();
                            this.fitMapToPredios();
                        }
                    }, 200);
                    setTimeout(() => clearInterval(waitForMap), 5000);
                }
                this.cdr.detectChanges();
            },
            error: () => {
                this.predios = [];
                this.loadMarkers();
                this.cdr.detectChanges();
            }
        });
    }

    private fitMapToPredios(): void {
        if (!this.map || this.predios.length === 0) return;

        // Note: in the API response lat/lng are swapped (lat has longitude values, lng has latitude values)
        const bounds = L.latLngBounds(
            this.predios.map(p => [p.centroid.lng, p.centroid.lat] as L.LatLngExpression)
        );
        this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    private loadEstados(): void {
        this.genericService.sendGetRequest<any>(paths.filterEstados, null, true).subscribe({
            next: (response: any) => {
                this.estados = [
                    { value: '', label: 'Todos' },
                    ...(response.states || []).map((s: any) => ({ value: String(s.code), label: s.name }))
                ];
                this.cdr.detectChanges();
            }
        });
    }

    onEstadoChange(estadoCode: string): void {
        this.selectedMunicipio = '';
        this.municipios = [{ value: '', label: 'Todos' }];

        if (!estadoCode) return;

        const url = `${paths.filterMunicipiosBase}/${estadoCode}/municipalities`;
        this.genericService.sendGetRequest<any>(url, null, true).subscribe({
            next: (response: any) => {
                this.municipios = [
                    { value: '', label: 'Todos' },
                    ...(response.municipalities || []).map((m: any) => ({ value: String(m.code), label: m.name }))
                ];
                this.cdr.detectChanges();
            }
        });
    }

    private loadEstatesCatalogs(): void {
        this.genericService.sendGetRequest<any>(paths.estatesCatalogs, null, true).subscribe({
            next: (response: any) => {
                this.mecanizacion = [
                    { value: '', label: 'Todos' },
                    ...(response.mechanization || []).map((m: any) => ({ value: String(m.id), label: m.name }))
                ];
                this.tiposRiego = [
                    { value: '', label: 'Todos' },
                    ...(response.water_irrigation_types || []).map((t: any) => ({ value: String(t.id), label: t.name }))
                ];
                this.modalidadesProduccion = [
                    { value: '', label: 'Todos' },
                    ...(response.production_modalities || []).map((p: any) => ({ value: String(p.id), label: p.name }))
                ];
                this.regimenHidrico = [
                    { value: '', label: 'Todos' },
                    ...(response.water_humidities || []).map((h: any) => ({ value: String(h.id), label: h.name }))
                ];
                this.tiposSuelo = [
                    { value: '', label: 'Todos' },
                    ...(response.soil_types || []).map((s: any) => ({ value: String(s.id), label: s.name }))
                ];
                this.nivelesPeligrosidad = [
                    { value: '', label: 'Todos' },
                    ...(response.danger_levels || []).map((d: any) => ({ value: String(d.id), label: d.name }))
                ];
                this.cultivos = [
                    { value: '', label: 'Todos' },
                    ...(response.production_systems || []).map((c: any) => ({ value: c.code, label: c.name }))
                ];
                this.cdr.detectChanges();
            }
        });
    }
}
