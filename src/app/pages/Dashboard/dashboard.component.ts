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
} from "@angular/core";
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.scss'],
    standalone: false,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard implements OnInit {
    private readonly cdr = inject(ChangeDetectorRef);

    @ViewChildren(BaseChartDirective)
    private readonly chartDirectives?: QueryList<BaseChartDirective>;

    protected readonly chartsReady = signal(false);

    public barChartData: ChartData<'bar'> = {
        labels: ['Masculino', 'Femenino', 'Prefiero no decir'],
        datasets: [
            {
                data: [450, 320, 75],
                label: 'Usuarios',
                backgroundColor: '#DAA520',
                borderColor: '#DAA520',
                borderWidth: 1,
                borderRadius: 6,
            }
        ]
    };

    public barChartOptions: ChartConfiguration<'bar'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: { color: '#b0bec5' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            },
            y: {
                ticks: { color: '#b0bec5' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            }
        }
    };

    public pieChartData: ChartData<'doughnut'> = {
        labels: ['Riego', 'Secano'],
        datasets: [{
            data: [2180, 1670],
            backgroundColor: ['#DAA520', '#1e7e74'],
            borderColor: ['#1b5e56', '#1b5e56'],
            borderWidth: 2,
            hoverOffset: 4
        }]
    };

    public pieChartOptions: ChartConfiguration<'doughnut'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        cutout: '58%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#b0bec5',
                    padding: 15,
                    boxWidth: 12
                }
            }
        }
    };

    public lineChartData: ChartData<'line'> = {
        labels: ['Maíz', 'Frijol', 'Trigo', 'Sorgo', 'Chile'],
        datasets: [
            {
                data: [750, 420, 580, 520, 380],
                label: 'Hectáreas',
                fill: false,
                borderColor: '#DAA520',
                backgroundColor: 'rgba(218, 165, 32, 0.15)',
                borderWidth: 2,
                tension: 0.35,
                pointBackgroundColor: '#DAA520',
                pointBorderColor: '#1b5e56',
                pointBorderWidth: 2,
                pointRadius: 5
            }
        ]
    };

    public lineChartOptions: ChartConfiguration<'line'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                ticks: { color: '#b0bec5' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            },
            y: {
                beginAtZero: true,
                ticks: { color: '#b0bec5' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            }
        }
    };

    public doughnutChartData: ChartData<'bar'> = {
        labels: ['Maíz', 'Frijol', 'Trigo', 'Sorgo', 'Chile'],
        datasets: [{
            data: [5600, 2100, 2900, 2200, 1300],
            label: 'Toneladas',
            backgroundColor: ['#C41E3A', '#C41E3A', '#C41E3A', '#C41E3A', '#C41E3A'],
            borderRadius: 6,
            borderSkipped: false,
        }]
    };

    public doughnutChartOptions: ChartConfiguration<'bar'>['options'] = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: {
                display: false,
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: { color: '#b0bec5' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            },
            y: {
                ticks: { color: '#b0bec5' },
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

    ngOnInit(): void {
        this.loadChartData();
    }

    private refreshCharts(): void {
        this.chartDirectives?.forEach((chartDirective) => {
            chartDirective.chart?.resize();
            chartDirective.update();
        });
    }

    loadChartData(): void {
        // Preparado para API real
    }
}
