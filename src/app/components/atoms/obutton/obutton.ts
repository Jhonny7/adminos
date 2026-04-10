import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'obutton',
  templateUrl: './obutton.html',
  styleUrls: ['./obutton.scss'],
  standalone: false
  //encapsulation: ViewEncapsulation.None
})
export class OButtonComponent implements OnDestroy, OnInit {

  @Input() extraClass?: string;
  @Input() onTap?: Function;   
  @Input() disabled: boolean = false;  

  constructor(
    public themeService: ThemeService
  ) {
  }

  public ngOnInit(): void {
  }

  public ngOnDestroy(): void {

  }

}
