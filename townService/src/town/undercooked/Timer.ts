export default class Timer {
  public currentTime: number;

  private _timerId: ReturnType<typeof setTimeout> | null;

  constructor(time: number) {
    this.currentTime = time;
    this._timerId = null;
  }

  public startTimer() {
    if (this._timerId === null) {
      this._timerId = setInterval(() => {
        this.currentTime--;
        if (this.currentTime <= 0) {
          this.stopTimer();
        }
      }, 1000);
    }
  }

  public stopTimer() {
    if (this._timerId !== null) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
  }
}
