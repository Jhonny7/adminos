import { Component, Input, OnInit } from '@angular/core';
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
      routerLink: '/admin/labors',
      exact: true
    }
  ];

  menu: MenuItem[] = [...this.fallbackMenu];

  constructor(
    private eventService: EventService,
    private router: Router,
    private loadingService: LoadingService,
    private genericService: GenericService,
  ) {

  }

  ngOnInit(): void {
    this.loadMenu();
  }

  private loadMenu(): void {
    this.loadingService.show('Cargando menú...');
    this.genericService.sendGetRequest<MenuResponse>(paths.menu, null, true).subscribe({
      next: (response: MenuResponse) => {
        const items = this.mapMenuItems(response?.menu || []);
        this.menu = items.length ? items : [...this.fallbackMenu];
        this.loadingService.hide();
      },
      error: () => {
        this.menu = [...this.fallbackMenu];
        this.loadingService.hide();
      }
    });
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