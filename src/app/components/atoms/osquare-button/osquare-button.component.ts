import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ThemeService } from "../../../services/theme.service";

@Component({
    selector: 'osquare-button',
    templateUrl: './osquare-button.html',
    styleUrls: ['./osquare-button.scss'],
    standalone: false
})
export class OSquareButtonComponent {
    @Output() onClick?: EventEmitter<any> = new EventEmitter();
    @Input() icon: string;
    @Input() type?:'' | 'outlined' | 'round' | 'symbols' = 'outlined';

    constructor(
        public themeService: ThemeService
    ) {

    }
}