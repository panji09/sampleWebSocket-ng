import { Injectable, OnDestroy } from '@angular/core';
import Ws from '@adonisjs/websocket-client';
import { environment } from '@env/environment';
import { Observable, BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService implements OnDestroy {
  private wsURL = environment.wsURL;
  private ws: any;
  isConnected = false;
  channel: any;
  ngUnsubscribe = new Subject<void>();
  statusConnection: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  public getStatusConnection: Observable<
    any
  > = this.statusConnection.asObservable();

  constructor() {}

  ngOnDestroy() {
    this.unSubscribe();
  }

  initSocket() {
    this.ws = Ws(this.wsURL);
    this.ws.connect();
    this.ws.on('open', () => {
      if (!this.isConnected) {
        console.log('socket open');
        this.channel = this.ws.subscribe(`backend:chat`);
      }
      this.isConnected = true;
      this.statusConnection.next(this.isConnected);
    });

    this.ws.on('close', () => {
      this.isConnected = false;
      this.statusConnection.next(this.isConnected);
    });
  }

  unSubscribe() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    // this.ws.close();
  }

  disconnect() {
    if (this.isConnected) {
      this.unSubscribe();
      this.ws.close();
    }
  }
  onEventMessage(event: any): Observable<any> {
    return new Observable<any>((observer) => {
      this.channel.on(event, (data: any) => observer.next(data));
    });
  }

  sendMessage(event: any, data: any) {
    if (this.isConnected) {
      this.channel.emit(event, data);
    }
  }
}
