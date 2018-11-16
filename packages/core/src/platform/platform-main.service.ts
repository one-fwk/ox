import { Inject, Injectable, OneContainer, Type, Utils } from '@one/core';
import { ComponentInstance, ComponentMeta } from '../interfaces';
import { COMPONENTS, PLATFORM_OPTIONS } from '../tokens';

@Injectable()
export class PlatformMainService {
  @Inject(PLATFORM_OPTIONS)
  private readonly namespace: string;

  public create(container: OneContainer) {
    const perf = window.performance;

    const components = Utils.flatten<ComponentMeta>(
      container.getAllProviders<any>(COMPONENTS),
    );

    components.forEach(cmpMeta => {
      this.defineComponent(cmpMeta, class extends HTMLElement {});
    });
  }

  private defineComponent(cmpMeta: ComponentMeta, HostElementConstructor: any) {
    if (!customElements.get(cmpMeta.tagNameMeta)) {

    }
  }
}