
import { Component, OnInit, Input } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';

@Component({
    selector: 'app-spinner',
    templateUrl: 'spinner.component.html',
    styleUrls: ['./spinner.component.scss'],
    standalone: false
})
export class SpinnerComponent implements OnInit {

    @Input() message;

    constructor(
        public themeService: ThemeService
    ) { }

    ngOnInit() {
    }
}