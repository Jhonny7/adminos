import { Subscription } from "rxjs";
import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
  HostListener
} from "@angular/core";
import { EventService } from "../../../services/event.service";
import { ThemeService } from "../../../services/theme.service";

@Component({
  selector: "ocontainer",
  templateUrl: "./ocontainer.html",
  styleUrls: ["./ocontainer.scss"],
  standalone: false
})
export class OContainerComponent implements OnDestroy, OnInit {

  @Input() extraClass: string = "";
  @Input() customId?: string;
  @Input() hasWaterMark: boolean = true;
  @Input() open: boolean = true;
  @Input() hasSemiContent: boolean = false;
  @Input() hasPadding: boolean = false;
  @Input() hasPaddingLeft: boolean = true;

  @Output() windowScroll = new EventEmitter<any>();
  @Output() windowResize = new EventEmitter<any>();

  public sus: Subscription | null = null;
  public forcePadding: boolean = true;

  constructor(
    public themeService: ThemeService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.handleResize(window.innerWidth);

    this.sus = this.eventService.get("closeoropen").subscribe((data: any) => {
      if (data !== undefined) {
        this.open = data == 1 ? false : true;
      } else {
        this.open = !this.open;
      }
    });
  }

  ngOnDestroy(): void {
    this.sus?.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(evt: any) {
    const width = evt.target.innerWidth;
    this.handleResize(width);
    this.windowResize.emit(evt);
  }

  @HostListener('scroll', ['$event'])
  onScroll(evt: any) {
    this.windowScroll.emit(evt);
  }

  private handleResize(width: number) {
    this.forcePadding = width >= 750;

    if (width <= 750) {
      this.eventService.send("closeoropen", 1);
    } else {
      this.eventService.send("closeoropen", 2);
    }
  }
}