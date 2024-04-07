import Timer from './Timer';

describe('Timer', () => {
  it('timer after 0 second', () => {
    const timer = new Timer(20);
    timer.startTimer();
    setTimeout(() => {
      timer.stopTimer();
      expect(timer.currentTime).toBe(20);
    });
  });

  it('timer after 1 second', () => {
    const timer1 = new Timer(20);
    timer1.startTimer();
    setTimeout(() => {
      timer1.stopTimer();
      expect(timer1.currentTime).toBe(19);
    }, 1000);
  });

  it('timer after 10 second', () => {
    const timer2 = new Timer(20);
    timer2.startTimer();
    setTimeout(() => {
      timer2.stopTimer();
      expect(timer2.currentTime).toBe(11);
    }, 10000);
  });

  it('timer after 19 second', () => {
    const timer3 = new Timer(20);
    timer3.startTimer();
    setTimeout(() => {
      timer3.stopTimer();
      expect(timer3.currentTime).toBe(2);
    }, 19000);
  });

  it('timer after 20 second', () => {
    const timer4 = new Timer(20);
    timer4.startTimer();
    setTimeout(() => {
      timer4.stopTimer();
      expect(timer4.currentTime).toBe(1);
    }, 20000);
  });

  it('timer after 21 second', () => {
    const timer5 = new Timer(20);
    timer5.startTimer();
    setTimeout(() => {
      timer5.stopTimer();
      expect(timer5.currentTime).toBe(0);
    }, 21000);
  });

  it('timer after 30 second', () => {
    const timer6 = new Timer(20);
    timer6.startTimer();
    setTimeout(() => {
      timer6.stopTimer();
      expect(timer6.currentTime).toBe(0);
    }, 30000);
  });
});
