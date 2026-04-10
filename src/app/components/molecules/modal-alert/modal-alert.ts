

import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'modal-alert',
  templateUrl: './modal-alert.html',
  styleUrls: ['./modal-alert.scss'],
  standalone: false
  //encapsulation: ViewEncapsulation.None
})
export class OModalAlertComponent implements OnDestroy, OnInit {
  @Input() extraClass: string = '';
  @Input() urlImg: string = '';
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() buttonText: string = '';
  @Input() onTap?:Function;
  @Output() onClicked: EventEmitter<any> = new EventEmitter();
  

  constructor(public themeService: ThemeService) {
    //console.log("ejemplo");
  }

  public ngOnInit(): void {}

  public ngOnDestroy(): void {}

  
}
