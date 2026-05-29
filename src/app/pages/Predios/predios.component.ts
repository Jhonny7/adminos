import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import * as L from 'leaflet';

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
    anios: FilterOption[] = [
        { value: '2025', label: '2025' },
        { value: '2024', label: '2024' },
        { value: '2023', label: '2023' }
    ];
    ciclos: FilterOption[] = [
        { value: '', label: 'Todos' },
        { value: 'pv', label: 'Primavera-Verano' },
        { value: 'oi', label: 'Otoño-Invierno' }
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

    prediosMecanizacion = 156;
    prediosRiego = 189;

    infraOpen = true;
    procesoOpen = false;
    recursosOpen = false;

    private geofencesLayer: L.LayerGroup = L.layerGroup();

    private readonly geofences = [
        {
            nombre: 'Zona Agrícola Norte',
            coords: [
                [20.66, -103.38],
                [20.67, -103.34],
                [20.65, -103.30],
                [20.63, -103.31],
                [20.62, -103.35],
                [20.64, -103.39]
            ] as L.LatLngExpression[],
            color: '#2D6A4F',
            predios: 45,
            superficie: 320
        },
        {
            nombre: 'Zona Agrícola Centro',
            coords: [
                [20.62, -103.37],
                [20.63, -103.33],
                [20.61, -103.30],
                [20.59, -103.32],
                [20.58, -103.36]
            ] as L.LatLngExpression[],
            color: '#b58728',
            predios: 62,
            superficie: 480
        },
        {
            nombre: 'Zona Agrícola Sur',
            coords: [
                [20.58, -103.44],
                [20.59, -103.40],
                [20.57, -103.38],
                [20.55, -103.39],
                [20.54, -103.42],
                [20.56, -103.45]
            ] as L.LatLngExpression[],
            color: '#7B2D8E',
            predios: 31,
            superficie: 210
        }
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

    constructor(private cdr: ChangeDetectorRef) {}

    ngOnInit(): void {}

    ngAfterViewInit(): void {
        setTimeout(() => this.initMap(), 500);
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
        this.geofencesLayer.addTo(this.map);
        this.loadGeofences();
        this.loadMarkers();

        this.map.invalidateSize();
    }

    private loadGeofences(): void {
        this.geofencesLayer.clearLayers();

        for (const geo of this.geofences) {
            const polygon = L.polygon(geo.coords, {
                color: geo.color,
                weight: 2,
                opacity: 0.8,
                fillColor: geo.color,
                fillOpacity: 0.15,
                dashArray: '6, 4'
            });

            polygon.bindPopup(`
                <div style="font-family: sans-serif; min-width: 180px;">
                    <strong style="font-size: 0.9rem; color: ${geo.color};">${geo.nombre}</strong>
                    <hr style="border: none; border-top: 1px solid #eef2f6; margin: 0.4rem 0;">
                    <div style="font-size: 0.78rem; color: #516173; line-height: 1.6;">
                        <div><b>Predios:</b> ${geo.predios}</div>
                        <div><b>Superficie:</b> ${geo.superficie} ha</div>
                    </div>
                </div>
            `);

            polygon.addTo(this.geofencesLayer);
        }
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
