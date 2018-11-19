import { Injectable, Injector, Reflector } from '@one/core';

import { Abstract, ComponentInstance, ComponentMeta, HostElement } from '../interfaces';
import { HostElementInstance } from './host-element';
import { Registry } from './registry';
import { COMPONENT_META } from '../tokens';

@Injectable()
export class PlatformService {
  public readonly supportsShadowDom = !!document.documentElement.attachShadow;
  public readonly reg = new Registry();
  public activeRender = false;

  public getCmpMetaFromComponent(component: Abstract<ComponentInstance>) {
    return Reflector.get(COMPONENT_META, component) as ComponentMeta;
  }

  public addComponents(components: Abstract<ComponentInstance>[], injector: Injector) {
    components.forEach(component => {
      const cmpMeta = this.getCmpMetaFromComponent(component);

      if (!this.reg.components.has(cmpMeta.tagNameMeta)) {
        this.reg.components.set(cmpMeta.tagNameMeta, [component, injector]);
        this.reg.cmpMeta.set(cmpMeta.tagNameMeta, cmpMeta);
      } else {
        throw new Error('Component already defined');
      }
    });
  }

  public dispatchEvent(elm: HostElement, eventName: string, data: any) {
    const event = new CustomEvent(eventName, data);
    elm && elm.dispatchEvent(event);
    return event;
  }

  public createComponent(elm: HostElement | HTMLElement) {
    const selector = elm.tagName.toLowerCase();
    const [, [component, injector]] = [...this.reg.components.entries()]
      .find(([tagName]) => tagName === selector);

    const instance = injector.resolve<ComponentInstance>(component);

    this.reg.instances.set(elm, instance);

    return instance;
  }

  public onAppInit() {
    this.reg.components.forEach(([component]) => {
      const cmpMeta = this.getCmpMetaFromComponent(component);

      if (!customElements.get(cmpMeta.tagNameMeta)) {
        const hostCtor = class extends HTMLElement {} as any;

        // define the custom element
        // initialize the members on the host element prototype
        // keep a ref to the metadata with the tag as the key
        const hostElement = new HostElementInstance(this, cmpMeta, hostCtor.prototype);

        hostCtor.observedAttributes = Object.values(cmpMeta.membersMeta)
          .map(member => member.attribName)
          .filter(attribName => !!attribName);

        hostElement.create();

        customElements.define(cmpMeta.tagNameMeta, hostCtor);
      }
    });
  }

}