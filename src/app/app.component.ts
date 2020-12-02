import { Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { race, Subject, timer } from 'rxjs';
import {filter, mapTo, scan } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  public mm = 0;
  public ss = 0;
  public ms = 0;
  public isRunning = false;
  public isWaiting = false;
  public timerId = 0;
  public results = [];
  private allowToClear = false;
  public button: HTMLButtonElement;

  @ViewChild('waitButton', { static: false }) waitButton: ElementRef;
  private obs$ = new Subject();
  private dblClick$: Subject<number>;


  public dbHandler(): void {
    if (!this.dblClick$) {
      this.dblClick$ = new Subject();
      race(
        timer(299).pipe(mapTo(false)),
        this.dblClick$.pipe(
          scan((acc) => acc + 1, 0),
          filter(count => count % 2 === 0),
          mapTo(true)
        )
      ).subscribe((doubleClick) => {
        if (doubleClick) {
          this.isWaiting = !this.isWaiting;
          this.intervalFunc();
        }
        this.dblClick$ = null;
      });
    }
    this.dblClick$.next();
  }

  public clickHandler(): void {
    if (this.isRunning || this.isWaiting) {
      this.results.push(`${this.format(this.mm)}:${this.format(this.ss)}:${this.format(this.ms)}`);
      this.clear();
      clearInterval(this.timerId);
      this.isRunning = false;
      this.isWaiting = false;
      console.log(this.results);
    } else {
      this.intervalFunc();
    }
  }

  public intervalFunc(): void {
    if (!this.isRunning) {
      // Stop => Running
      this.timerId = setInterval(() => {
        this.ms++;

        if (this.ms >= 100) {
          this.ss++;
          this.ms = 0;
        }
        if (this.ss >= 60) {
          this.mm++;
          this.ss = 0;
        }
      }, 10);
    } else {
      clearInterval(this.timerId);
    }
    this.isRunning = !this.isRunning;
  }

  public clear(): void {
    this.ms = 0;
    this.mm = 0;
    this.ss = 0;
  }


  public format(num: number): string {
    return (num + '').length === 1 ? '0' + num : num + '';
  }

  ngOnDestroy(): void {
    this.obs$.next();
    this.obs$.complete();
  }
}
