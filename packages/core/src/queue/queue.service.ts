import { Injectable } from '@one/core';

import { PlatformService } from '../platform';
import { QueueClient } from './queue-client.service';
import { ComponentInstance, HostElement } from '../interfaces';

@Injectable()
export class Queue {
  constructor(
    private readonly queueClient: QueueClient,
    private readonly plt: PlatformService,
  ) {}

  public add(elm: HostElement) {
    // no longer queued for update
    // this.plt.reg.isQueuedForUpdate.delete(elm);

    if (!this.plt.reg.isDisconnected.has(elm)) {
      let ancestorHostElement: HostElement;
      let instance = this.plt.reg.instances.get(elm);
      let isInitialLoad = !instance;

      if (isInitialLoad) {
        ancestorHostElement = this.plt.reg.ancestorHostElements.get(elm);

        if (ancestorHostElement && !ancestorHostElement['s-rn']) {
          // this is the intial load
          // this element has an ancestor host element
          // but the ancestor host element has NOT rendered yet
          // so let's just cool our jets and wait for the ancestor to render
          (ancestorHostElement['s-rc'] = ancestorHostElement['s-rc'] || []).push(() => {
            // this will get fired off when the ancestor host element
            // finally gets around to rendering its lazy self
            this.update(elm);
          });
          return;
        }

        // haven't created a component instance for this host element yet!
        // create the instance from the user's component class
        // https://www.youtube.com/watch?v=olLxrojmvMg
        instance = this.plt.createComponent(elm);
      }
    }
  }
  private update(elm: HostElement) {}
}