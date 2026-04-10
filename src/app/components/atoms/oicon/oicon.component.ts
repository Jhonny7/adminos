import { Component, Input, OnInit } from "@angular/core";

@Component({
    selector: 'oicon',
    templateUrl: './oicon.html',
    styleUrls: ['./oicon.scss'],
    standalone: false
})
export class OIconComponent implements OnInit {

    @Input() name: string;
    @Input() extraClass: string;
    @Input() type: '' | 'outlined' | 'round' | 'symbols' = 'outlined'

    public classMap = {
        '': 'material-icons',
        'outlined': 'material-icons-outlined',
        'round': 'material-icons-round',
        'symbols': 'material-symbols-outlined',
    }

    constructor() {

    }

    ngOnInit(){
         console.log(this.classMap[this.type]);
    
    }
}