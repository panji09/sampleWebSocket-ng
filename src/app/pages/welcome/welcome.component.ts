import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { SocketService } from '@shared/services/socket.service';
import { Subject } from 'rxjs';
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
export class WelcomeComponent implements OnInit {
  listOfData: IStep[] = [];
  dataChart: any = [];
  ngUnsubscribe = new Subject<void>();
  constructor(
    private socketService: SocketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.socketService.initSocket();

    this.socketService.getStatusConnection
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((x) => {
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
              this.dataChart = xresult;
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

    setInterval(() => {
      // Step 2: Load the data.
      console.log(this.dataChart);
      chart.changeData(this.dataChart);

      // Step 3: Declare the grammar of graphics, draw column chart.
      chart.interval().position('step*total');

      // Step 4: Render chart.
      // chart.render();
      // this.cdr.detectChanges();
    }, 1000);
  }
}
