import { Injectable, Injector } from '@one/core';

import { AbstractComponent, ComponentInstance, HostElement } from '../interfaces';
import { HostElementController } from './host-element-controller';
import { RegistryService } from './registry.service';
import { RendererService } from '../queue';
import { Metadata } from '../collection';

@Injectable()
export class PlatformService {
  public readonly supportsShadowDom = !!document.documentElement.attachShadow;
  public isAppLoaded = false;
  public activeRender = false;

  constructor(
    private readonly registry: RegistryService,
    private readonly renderer: RendererService,
  ) {}

  public onAppInit() {
    this.isAppLoaded = true;
  }

  public addComponents(components: AbstractComponent[], injector: Injector) {
    components.forEach(component => {
      const cmpMeta = Metadata.getComponentMetadata(component);

      if (!this.registry.components.has(cmpMeta.tagNameMeta) /*!customElements.get(cmpMeta.tagNameMeta)*/) {
        this.registry.components.set(cmpMeta.tagNameMeta, [component, injector]);
        this.registry.cmpMeta.set(cmpMeta.tagNameMeta, cmpMeta);

        const hostCtor = class extends HTMLElement {} as any;

        // define the custom element
        // initialize the members on the host element prototype
        // keep a ref to the metadata with the tag as the key
        const hostElmCtrl = new HostElementController(this, this.renderer, cmpMeta, hostCtor.prototype);

        hostCtor.observedAttributes = Object.values(cmpMeta.membersMeta)
          .map(member => member.attribName)
          .filter(attribName => !!attribName);

        hostElmCtrl.create();

        customElements.define(cmpMeta.tagNameMeta, hostCtor);
      } else {
        throw new Error(`Component ${cmpMeta.tagNameMeta} is already declared!`);
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
    const [, [component, injector]] = [...this.registry.components.entries()]
      .find(([tagName]) => tagName === selector);

    // Should I just resolve it or actually bind it?
    const instance = injector.resolve<ComponentInstance>(component);

    /*(<Injector>injector).bind(component).toSelf();
    const instance = injector.get<ComponentInstance>(component);*/

    this.registry.instances.set(elm, instance);

    return instance;
  }

}