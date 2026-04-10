import {
  Directive,
  OnDestroy,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, buffer, filter, map } from "rxjs/operators";

@Directive({
  selector: '[doubleClick]',
})
export class DoubleClickDirective implements OnDestroy {
    private click$ = new Subject<MouseEvent>();

    @Output()
    doubleClick = new EventEmitter<MouseEvent>();
  
    @HostListener("click", ["$event"])
    onClick(event) {
      this.click$.next(event);
    }
  
    ngOnInit() {
      this.click$
        .pipe(
          buffer(this.click$.pipe(debounceTime(250))),
          filter(list => list.length === 2),
          map(list => list[1])
        )
        .subscribe(this.doubleClick);
    }
  
    ngOnDestroy() {
      this.click$.complete();
    }
}
