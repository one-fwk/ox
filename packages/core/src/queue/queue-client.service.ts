import { Injectable } from '@one/core';

export interface RafCallback {
  (timeStamp: number): void;
}

@Injectable()
export class QueueClient {
  private readonly raf = window.requestAnimationFrame.bind(window);
  private readonly highPriority = new Set<RafCallback>();
  private readonly domWrites = new Set<RafCallback>();
  private readonly domReads = new Set<RafCallback>();
  private readonly resolved = Promise.resolve();
  private rafPending = false;
  private congestion = 0;

  private flush() {
    this.congestion++;

    // always force a bunch of medium callbacks to run, but still have
    // a throttle on how many can run in a certain time

    // DOM READS!!!
    this.consume(this.domReads);

    // DOM WRITES!!!
    this.consume(this.domWrites);

    if (this.rafPending = ((this.domReads.size + this.domWrites.size) > 0)) {
      // still more to do yet, but we've run out of time
      // let's let this thing cool off and try again in the next tick
      this.raf(() => this.flush());
    } else {
      this.congestion = 0;
    }
  }

  private queueTask(queue: Set<RafCallback>, cb: RafCallback) {
    // queue dom reads
    queue.add(cb);

    if (!this.rafPending) {
      this.raf(() => this.flush());
    }
  }

  private consume(queue: Set<RafCallback>) {
    queue.forEach(cb => {
      try {
        cb(performance.now());
      } catch (e) {
        console.error(e);
      }
    });

    queue.clear();
  }

  public tick(cb: RafCallback) {
    // queue high priority work to happen in next tick
    // uses Promise.resolve() for next tick
    this.highPriority.add(cb);

    if (this.highPriority.size === 1) {
      this.resolved.then(() => this.consume(this.highPriority));
    }
  }

  public read(cb: RafCallback) {
    this.queueTask(this.domReads, cb);
  }

  public write(cb: RafCallback) {
    this.queueTask(this.domWrites, cb)
  }
}