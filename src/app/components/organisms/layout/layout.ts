import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { events } from '../../../../environments/environment.prod';
import { Login } from '../../../pages/login/login.component';
import { AlertService, IButtonSheet } from '../../../services/alert.service';
import { EventService } from '../../../services/event.service';

export interface MenuHeader {
  icon: string,
  onClick: Function,
  type?: '' | 'outlined' | 'round' | 'symbols'
}

@Component({
  selector: 'app-layout',
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss'],
  standalone: false
})
export class LayoutComponent implements OnInit, OnDestroy {

  collapsed = false;
  isMobile = false;
  mobileOpen = false;
  isHeaderVisible = true;
  private lastScrollTop = 0;

  public suscriptionEvent: Subscription = null;

  @Input() rightIcons: Array<MenuHeader> = [
    {
      icon: "settings",
      onClick: (e) => {
        /* const buttons: IButtonSheet[] = [
          {
            text: 'Edit',
            icon: 'edit',
            handler: () => {
              console.log('Edit clicked');
              // Your edit logic here
            }
          },
          {
            text: 'Delete',
            icon: 'delete',
            handler: () => {
              console.log('Delete clicked');
              // Your delete logic here
            }
          },
          {
            text: 'Share',
            icon: 'share',
            handler: () => {
              console.log('Share clicked');
              // Your share logic here
            }
          }
        ];

        this.alertService
          .openActionSheet(buttons, 'Options', true, false)
          .then((selectedIndex) => {
            if (selectedIndex !== null) {
              console.log('User selected button:', selectedIndex);
            } else {
              console.log('Action sheet closed');
            }
          }); */
        const panelData = {
          title: 'Login',
          mode: 'modal'
        };

        this.alertService
          .openPanel(
            Login,
            'Login',
            'right',
            panelData
          )
          .then(() => {
            console.log('Panel closed');
          });
      }

    }, {
      icon: "colors",
      type: "symbols",
      onClick: (e) => {
        console.log("colors");

        const buttons: IButtonSheet[] = [
          {
            text: 'View',
            icon: 'visibility',
            handler: () => console.log('View clicked')
          },
          {
            text: 'Edit',
            icon: 'edit',
            handler: () => console.log('Edit clicked')
          },
          {
            text: 'Delete',
            icon: 'delete',
            handler: () => console.log('Delete clicked')
          }
        ];

        this.alertService.openPopover(buttons, 'Menu Title', e)
      }
    }, {
      icon: "logout",
      onClick: (e) => {

        console.log("logout");

        const buttons: IButtonSheet[] = [
          {
            text: 'Edit',
            icon: 'edit',
            handler: () => {
              console.log('Edit clicked');
              // Your edit logic
            }
          },
          {
            text: 'Share',
            icon: 'share',
            handler: () => {
              console.log('Share clicked');
            }
          },
          {
            text: 'Delete',
            icon: 'delete',
            handler: () => {
              console.log('Delete clicked');
            }
          }
        ];

        this.alertService
          .openActionSheet(buttons, 'Choose Action', true)
          .then((result) => {
            console.log('Sheet closed, result:', result);
          });
      }
    },
  ]

  constructor(
    private eventService: EventService,
    private alertService: AlertService,
  ) {

  }

  ngOnInit() {
    this.checkScreen();
    window.addEventListener('resize', this.checkScreen.bind(this));

    this.suscriptionEvent = this.eventService.get(events.OPEN_MENU).subscribe((data: any) => {
      this.toggleMenu(data);
    });

  }

  ngOnDestroy(): void {

  }

  checkScreen() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;

    if (this.isMobile) {
      this.mobileOpen = false; // cerrar por defecto en móvil
      if (!wasMobile) {
        this.collapsed = false;
      }
    } else {
      this.mobileOpen = true;
      if (wasMobile) {
        this.collapsed = false;
      }
    }
  }

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    if (this.isMobile) {
      this.mobileOpen = !this.mobileOpen;
    } else {
      this.collapsed = !this.collapsed;
    }
  }

  handleContentClick() {
    if (this.isMobile && this.mobileOpen) {
      this.mobileOpen = false;
    }
  }

  onScroll(event: any) {
    const scrollTop = event.target.scrollTop;
    const scrollDelta = scrollTop - this.lastScrollTop;

    // Hide header when scrolling down, show when scrolling up
    if (Math.abs(scrollDelta) > 10) { // Threshold to avoid jitter
      this.isHeaderVisible = scrollDelta < 0;
      this.lastScrollTop = scrollTop;
    }
  }
}