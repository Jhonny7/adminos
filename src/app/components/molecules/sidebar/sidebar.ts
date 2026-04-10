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

  menu = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      open: false
    },
    {
      label: 'Usuarios',
      icon: 'group',
      open: false,
      children: [
        { label: 'Lista' },
        { label: 'Crear' }
      ]
    },
    {
      label: 'Configuración',
      icon: 'settings',
      open: false
    }
  ];

  constructor(
    private eventService: EventService
  ) {

  }

  toggle(item: any) {
    if (item.children) {
      item.open = !item.open;
    }
  }

  openMenu(e) {
    this.eventService.send(events.OPEN_MENU, e)
  }
}