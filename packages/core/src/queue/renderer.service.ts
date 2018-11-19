import { Injectable } from '@one/core';

import { PlatformService, RegistryService } from '../platform';
import { QueueService } from './queue.service';
import { RUNTIME_ERROR } from '../collection';
import { VDomService } from '../vdom';
import { HostElement } from '../interfaces';

@Injectable()
export class RendererService {
  constructor(
    private readonly queue: QueueService,
    private readonly platform: PlatformService,
    private readonly registry: RegistryService,
    private readonly vdom: VDomService,
  ) {}

  public queue(elm: HostElement) {
    // we're actively processing this component
    this.registry.processingCmp.add(elm);

    if (!this.registry.isQueuedForUpdate.has(elm)) {
      this.registry.isQueuedForUpdate.set(elm, true);
      // run the patch in the next tick
      // vdom diff and patch the host element for differences
      if (this.platform.isAppLoaded) {
        // app has already loaded
        // let's queue this work in the dom write phase
        this.queue.write(() => this.update(elm));
      } else {
        // app hasn't finished loading yet
        // so let's use next tick to do everything
        // as fast as possible
        this.queue.tick(() => this.update(elm));
      }
    }
  }

  private async update(elm: HostElement) {
    // no longer queued for update
    // this.plt.reg.isQueuedForUpdate.delete(elm);

    if (!this.registry.isDisconnected.has(elm)) {
      const cmpMeta = this.registry.getCmpMeta(elm);
      let instance = this.registry.instances.get(elm);

      if (!instance) {
        const ancestorHostElement = this.registry.ancestorHostElements.get(elm);

        if (ancestorHostElement && !ancestorHostElement['ox-rn']) {
          // this is the initial load
          // this element has an ancestor host element
          // but the ancestor host element has NOT rendered yet
          // so let's just cool our jets and wait for the ancestor to render
          (ancestorHostElement['ox-rc'] = ancestorHostElement['ox-rc'] || []).push(() => {
            // this will get fired off when the ancestor host element
            // finally gets around to rendering its lazy self
            return this.update(elm);
          });
          return;
        }

        // haven't created a component instance for this host element yet!
        // create the instance from the user's component class
        // https://www.youtube.com/watch?v=olLxrojmvMg
        instance = this.platform.createComponent(elm);

        if (instance.componentWillLoad) {
          try {

          } catch (e) {
            console.error(e, RUNTIME_ERROR.WillLoadError, elm);
          }
        }

      } else if (instance.componentWillUpdate) {
        try {
          await instance.componentWillUpdate();
        } catch (e) {
          console.error(e, RUNTIME_ERROR.WillUpdateError, elm);
        }
      }

      this.vdom.render(cmpMeta, elm, instance);

      elm['ox-init']();
      /*
      if (_BUILD_.hotModuleReplacement) {
        elm['s-hmr-load'] && elm['s-hmr-load']();
      }
      */
    }
  }
}