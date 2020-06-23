import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { SocketService } from '@shared/services/socket.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Chart } from '@antv/g2';

interface IStep {
  id: string;
  step: string;
  result: string;
}
@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeComponent implements OnInit, OnDestroy {
  listOfData: IStep[] = [];
  // dataChart: any = [];
  loading = {
    start: false,
    stop: false,
  };
  ngUnsubscribe = new Subject<void>();
  isConnected = false;
  statusConnection: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  dataChart: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  interval: any;
  constructor(
    private socketService: SocketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.reloadData();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  clickStart() {
    this.loading.start = true;
    this.socketService.initSocket();
    this.socketService.statusConnection
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((status) => {
        this.isConnected = status;
        this.statusConnection.next(status);
        if (status) {
          this.loading.start = false;
        }
      });
  }
  clickStop() {
    this.loading.stop = true;
    this.socketService.disconnect();
    this.loading.stop = false;
  }

  reloadData() {
    this.statusConnection.pipe(takeUntil(this.ngUnsubscribe)).subscribe((x) => {
      if (x) {
        // send message
        this.socketService.sendMessage('getData', { tahun: 2020 });

        // get message
        this.socketService
          .onEventMessage('getData')
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((data: IStep) => {
            console.log(data);
            this.listOfData = [
              ...this.listOfData,
              {
                id: data.id,
                step: data.step,
                result: data.result,
              },
            ];

            const xresult = [];
            this.listOfData.reduce((res, value) => {
              if (!res[value.id]) {
                res[value.id] = { id: value.id, step: value.step, total: 0 };
                xresult.push(res[value.id]);
              }
              res[value.id].total += Number(value.result);
              return res;
            }, {});
            this.dataChart.next(xresult);
            this.cdr.markForCheck();
          });
      }
    });
    this.renderChart();
  }
  renderChart() {
    // Step 1: Create a Chart instance.
    const chart = new Chart({
      container: 'c1', // Specify chart container ID
      autoFit: true,
      height: 300, // Specify chart height
    });

    this.dataChart.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      console.log(data);
      chart.changeData(data);

      chart.interval().position('step*total');
    });
  }
}
