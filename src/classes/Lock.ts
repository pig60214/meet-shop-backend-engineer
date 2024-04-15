import { EventEmitter } from 'events';

export default class Lock {
  private locked: Record<string, boolean> = {};

  private eventEmitter = new EventEmitter();

  constructor() {
    this.eventEmitter.setMaxListeners(0);
  }

  private async acquireKey(key: string) {
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

  private releaseKey(key: string) {
    delete this.locked[key];
    setImmediate(() => this.eventEmitter.emit(key));
  }

  async acquire(key: string | string[]) {
    if (typeof key === 'string') {
      await this.acquireKey(key);
    } else {
      const promises = key.map(k => this.acquireKey(k));
      await Promise.all(promises);
    }
  }

  release(key: string | string[]) {
    if (typeof key === 'string') {
      this.releaseKey(key);
    } else {
      key.forEach(k => {
        this.releaseKey(k);
      });
    }
  }
}
