/*import { Injectable, Injector } from '@one/core';

import { ComponentRegistry, ControllerComponents } from './maps';
import { ComponentMeta, HostElement } from '../interfaces';
import { MetadataStorage } from '../metadata-storage';

@Injectable()
export class PlatformMainService {
  private readonly perf = window.performance;

  constructor(
    private readonly controllerComponents: ControllerComponents,
    private readonly cmpRegistry: ComponentRegistry,
    private readonly injector: Injector,
  ) {}

  public defineComponent(cmpMeta: ComponentMeta, HostElementConstructor: any) {
    if (!customElements.get(cmpMeta.tagNameMeta)) {
      const props = MetadataStorage.getProps(cmpMeta.componentConstructor);

      const component = this.injector.resolve(componentRef);
      // define the custom element
      // initialize the members on the host element prototype
      // keep a ref to the metadata with the tag as the key
      HostElementConstructor.observedAttributes = Object.values(cmpMeta.membersMeta)
    }
  }
}*/