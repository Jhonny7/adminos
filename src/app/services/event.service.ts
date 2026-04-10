import { Injectable, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/**
 * Servicio de eventos
 */
@Injectable({
  providedIn: 'root',
})
export class EventService implements OnInit {
  private subject = new Subject<any>();

  private subjects: Array<any> = [];

  ngOnInit(): void {
    //console.log("event service");
  }

  /**Multiples with topic */
  send(topic: string, data: any) {
    if (!this.subjects[topic]) {
      this.subjects[topic] = new Subject<any>();
      window.addEventListener(topic, (data: any) => {
        this.subjects[topic].next(data.detail);
      });
    }
    window.dispatchEvent(new CustomEvent(topic, { detail: data }));
  }

  clear(topic: string) {
    this.subjects[topic].next();
    delete this.subjects[topic];
  }

  get(topic: string): Observable<any> {
    if (!this.subjects[topic]) {
      this.subjects[topic] = new Subject<any>();
      window.addEventListener(topic, (data: any) => {
        this.subjects[topic].next(data.detail);
      });
    }
    //console.log(this.subjects);

    return this.subjects[topic].asObservable();
  }

  ///////LOGICA VIEJA ARCAICA YA NO SIRVE
  //private subject = new Subject<any>();

  sendEvent(data: any) {
    this.subject.next({ data });
  }

  clearEvent() {
    this.subject.next(null);
  }

  getEvent(): Observable<any> {
    return this.subject.asObservable();
  }
}
