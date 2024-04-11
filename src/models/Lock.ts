import { EventEmitter } from 'events';

export default class Lock {
  private locked: Record<string, boolean> = {};

  private eventEmitter = new EventEmitter();

  constructor() {
    this.eventEmitter.setMaxListeners(0);
  }

  async acquire(key: string) {
    return new Promise<void>((resolve) => {
      if (!this.locked[key]) {
        this.locked[key] = true;
        resolve();
        return;
      }

      const tryAcquire = () => {
        if (!this.locked[key]) {
          this.locked[key] = true;
          this.eventEmitter.removeListener(key, tryAcquire);
          resolve();
        }
      };

      this.eventEmitter.on(key, tryAcquire);
    });
  }

  release(key: string) {
    delete this.locked[key];
    setImmediate(() => this.eventEmitter.emit(key));
  }
}
