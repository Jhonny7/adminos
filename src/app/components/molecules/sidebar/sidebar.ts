import { Component, Input } from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';
import { EventService } from '../../../services/event.service';
import { events } from '../../../../environments/environment.prod';
import { Router } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  routerLink?: string;
  exact?: boolean;
  open?: boolean;
  children?: any[];
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
export class SidebarComponent {

  @Input() collapsed = false;
  @Input() isMobile = false;

  menu: MenuItem[] = [
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

  constructor(
    private eventService: EventService,
    private router: Router
  ) {

  }

  toggle(item: MenuItem) {
    if (item.children) {
      item.open = !item.open;
    }
  }

  openMenu(e) {
    this.eventService.send(events.OPEN_MENU, e)
  }
}