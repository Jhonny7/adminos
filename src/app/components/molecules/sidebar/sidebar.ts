import { ChangeDetectorRef, Component, Input, NgZone, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';
import { EventService } from '../../../services/event.service';
import { events, paths } from '../../../../environments/environment.prod';
import { Router } from '@angular/router';
import { GenericService } from '../../../services/generic.service';
import { LoadingService } from '../../../services/loading-service';

interface MenuItem {
  label: string;
  icon: string;
  routerLink?: string;
  exact?: boolean;
  open?: boolean;
  children?: MenuItem[];
}

interface MenuApiItem {
  id: number;
  name: string;
  label: string;
  icon?: string;
  route?: string;
  sort_order?: number;
  children?: MenuApiItem[];
}

interface MenuResponse {
  menu?: MenuApiItem[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
  standalone: false,
  animations: [
    trigger('submenuAnimation', [
      state('closed', style({
        height: '0px',
        opacity: 0,
        overflow: 'hidden'
      })),
      state('open', style({
        height: '*',
        opacity: 1
      })),
      transition('closed <=> open', [
        animate('250ms ease-in-out')
      ])
    ])
  ]
})
export class SidebarComponent implements OnInit {

  @Input() collapsed = false;
  @Input() isMobile = false;

  private readonly extraMenuItems: MenuItem[] = [
    {
      label: 'Resumen Pecuario',
      icon: 'pets',
      routerLink: '/admin/resumen-pecuario',
      exact: true
    },
    {
      label: 'Resumen del Rancho',
      icon: 'home',
      routerLink: '/admin/resumen-rancho',
      exact: true
    },
    {
      label: 'Uso de Suelo y Vegetación',
      icon: 'park',
      routerLink: '/admin/uso-suelo-vegetacion',
      exact: true
    },
    {
      label: 'Infraestructura del Rancho',
      icon: 'business',
      routerLink: '/admin/infraestructura-rancho',
      exact: true
    },
    {
      label: 'Sanidad y Vacunación',
      icon: 'vaccines',
      routerLink: '/admin/sanidad-vacunacion',
      exact: true
    }
  ];

  private readonly fallbackMenu: MenuItem[] = [
    {
      label: 'Resumen Ejecutivo',
      icon: 'space_dashboard',
      routerLink: '/admin',
      exact: true
    },
    {
      label: 'Mis Labores',
      icon: 'assignment',
      routerLink: '/admin/labores',
      exact: true
    },
    {
      label: 'Plaguicidas',
      icon: 'pest_control',
      routerLink: '/admin/plaguicidas',
      exact: true
    },
    //...this.extraMenuItems
  ];

  menu: MenuItem[] = [...this.fallbackMenu];

  constructor(
    private eventService: EventService,
    private router: Router,
    private loadingService: LoadingService,
    private genericService: GenericService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {

  }

  ngOnInit(): void {
    this.loadMenu();
  }

  private loadMenu(): void {
    this.loadingService.show('Cargando menú...');
    this.genericService.sendGetRequest<MenuResponse>(paths.menu, null, true).subscribe({
      next: (response: MenuResponse) => {
        this.ngZone.run(() => {
          const items = this.mergeExtraMenuItems(this.mapMenuItems(response?.menu || []));
          this.menu = items.length ? items : [...this.fallbackMenu];
          this.cdr.detectChanges();
          this.loadingService.hide();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.menu = [...this.fallbackMenu];
          this.cdr.detectChanges();
          this.loadingService.hide();
        });
      }
    });
  }

  private mergeExtraMenuItems(items: MenuItem[]): MenuItem[] {
    const routes = new Set(items.map((item) => item.routerLink).filter(Boolean));
    const missingItems = this.extraMenuItems.filter((item) => !routes.has(item.routerLink));

    return [...items];
  }

  private mapMenuItems(items: MenuApiItem[] = []): MenuItem[] {
    return [...items]
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((item) => ({
        label: item.label,
        icon: this.normalizeIcon(item.icon),
        routerLink: this.normalizeRoute(item.route),
        exact: !(item.children?.length),
        open: false,
        children: item.children?.length ? this.mapMenuItems(item.children) : []
      }));
  }

  private normalizeRoute(route?: string): string | undefined {
    if (!route) {
      return undefined;
    }

    const normalizedRoute = route.startsWith('/') ? route : `/${route}`;

    if (normalizedRoute === '/dashboard') {
      return '/admin';
    }

    if (normalizedRoute.startsWith('/admin')) {
      return normalizedRoute;
    }

    return `/admin${normalizedRoute}`;
  }

  private normalizeIcon(icon?: string): string {
    return (icon || 'menu').replace(/-/g, '_');
  }

  toggle(item: MenuItem): void {
    if (item.children?.length) {
      item.open = !item.open;
    }
  }

  openMenu(e: Event): void {
    this.eventService.send(events.OPEN_MENU, e);
  }
}
