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

@Component({
    selector: 'app-labors',
    templateUrl: './labors.html',
    styleUrls: ['./labors.scss'],
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Labors implements OnInit {
    private readonly cdr = inject(ChangeDetectorRef);

    @ViewChildren(BaseChartDirective)
    private readonly chartDirectives?: QueryList<BaseChartDirective>;

    protected readonly chartsReady = signal(false);

    public laborTypeData: ChartData<'bar'> = {
        labels: [
            'Preparación del terreno',
            'Siembra / Trasplante',
            'Fertilización',
            'Control de plagas',
            'Riego',
            'Labor cultural',
            'Cosecha',
            'Comercialización'
        ],
        datasets: [
            {
                data: [310, 220, 360, 170, 460, 120, 150, 130],
                label: 'Registros',
                backgroundColor: [
                    '#c8962c', '#c8962c', '#bf3159', '#e1cb89',
                    '#c8962c', '#bf3159', '#bf3159', '#e1cb89'
                ],
                borderRadius: 6,
                borderSkipped: false,
            }
        ]
    };

    public laborTypeOptions: ChartConfiguration<'bar'>['options'] = {
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
                ticks: { color: '#c6d2cf' },
                grid: { color: 'rgba(255,255,255,0.08)' }
            },
            y: {
                ticks: { color: '#c6d2cf', font: { size: 10 } },
                grid: { display: false }
            }
        }
    };

    public monthlyData: ChartData<'bar'> = {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        datasets: [{
            data: [110, 140, 190, 230, 290, 255, 220, 185, 170, 145, 130, 95],
            label: 'Labores',
            backgroundColor: '#c8962c',
            borderRadius: 4,
            borderSkipped: false,
        }]
    };

    public monthlyOptions: ChartConfiguration<'bar'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                ticks: { color: '#c6d2cf', font: { size: 10 } },
                grid: { color: 'rgba(255,255,255,0.05)' }
            },
            y: {
                beginAtZero: true,
                ticks: { color: '#c6d2cf' },
                grid: { color: 'rgba(255,255,255,0.08)' }
            }
        }
    };

    public adoptionData: ChartData<'bar'> = {
        labels: [
            'Barreras muertas',
            'Zanjas bordo',
            'Siembra directa',
            'Terrazas individuales',
            'Barreras vivas',
            'Siembra en curvas de nivel',
            'Cultivos de cobertura',
            'Labranza mínima / reducida',
            'Incorporación de materia orgánica'
        ],
        datasets: [{
            data: [8, 12, 19, 24, 27, 39, 43, 54, 69],
            label: '% de adopción',
            backgroundColor: '#9cc7bf',
            borderRadius: 6,
            borderSkipped: false,
        }]
    };

    public adoptionOptions: ChartConfiguration<'bar'>['options'] = {
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
                max: 100,
                ticks: { color: '#c6d2cf' },
                grid: { color: 'rgba(255,255,255,0.08)' }
            },
            y: {
                ticks: { color: '#c6d2cf', font: { size: 10 } },
                grid: { display: false }
            }
        }
    };

    constructor() {
        afterNextRender(() => {
            this.chartsReady.set(true);
            this.cdr.detectChanges();
            requestAnimationFrame(() => this.refreshCharts());
            setTimeout(() => this.refreshCharts(), 120);
        });
    }

    ngOnInit(): void {}

    private refreshCharts(): void {
        this.chartDirectives?.forEach((chartDirective) => {
            chartDirective.chart?.resize();
            chartDirective.update();
        });
    }
}
