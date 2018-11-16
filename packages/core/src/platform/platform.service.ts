import { Injectable, Injector } from '@one/core';

import { ComponentMeta, HostElement, VNode } from '../interfaces';

@Injectable()
export class PlatformService {
  public readonly supportsShadowDom = !!document.documentElement.attachShadow;
  public readonly vnodeMap = new WeakMap<HostElement, VNode>();
  public readonly cmpRegistry = new Map<string, ComponentMeta>();
  public activeRender = false;

  constructor(private readonly components: Injector) {}

  private initHostElement(
    cmpMeta: ComponentMeta,
    HostElementPrototype: HostElement,
  ) {
    const self = this;
    // let's wire up our functions to the host element's prototype
    // we can also inject our platform into each one that needs that api
    // note: these cannot be arrow functions cuz "this" is important here hombre

    HostElementPrototype.connectedCallback = function () {
      // coolsville, our host element has just hit the DOM
    };

    HostElementPrototype.disconnectedCallback = function () {
      // the element has left the builing
    };

    HostElementPrototype['s-init'] = function () {
      // initComponentLoaded(plt, this, hydratedCssClass, perf);
    };

    HostElementPrototype.forceUpdate = function () {
      // queueUpdate(plt, this, perf);
    };

    if (cmpMeta.membersMeta) {
      const entries = Object.entries(cmpMeta.membersMeta);
      const attrToProp = entries.reduce((_, [propName, {attribName}]) => ({

      }), {} as any);
    }

    // add getters/setters to the host element members
    // these would come from the @Prop and @Method decorators that
    // should create the public API to this component
    // proxyHostElementPrototype(plt, entries, HostElementConstructor, perf);
  }

  public defineComponent(
    cmpMeta: ComponentMeta,
    HostElementConstructor: any,
  ) {
    if (!customElements.get(cmpMeta.tagNameMeta)) {
      this.cmpRegistry.set(cmpMeta.tagNameMeta, cmpMeta);

      this.initHostElement(cmpMeta, HostElementConstructor.prototype);

      // define the custom element
      // initialize the members on the host element prototype
      // keep a ref to the metadata with the tag as the key

      customElements.define(cmpMeta.tagNameMeta, HostElementConstructor);
    }
  }
}