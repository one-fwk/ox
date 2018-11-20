import { Injectable, Injector, Utils } from '@one/core';

import { HostElementController } from './host-element-controller';
import { RegistryService } from './registry.service';
import { RendererService } from '@ox/core/queue';
import {
  KEY_CODE_MAP,
  MEMBER_TYPE,
  Metadata,
  AbstractComponent,
  ComponentInstance,
  HostElement,
} from '@ox/collection';

@Injectable()
export class PlatformService {
  public readonly supportsShadowDom = !!document.documentElement.attachShadow;
  public hasConnectedComponent = false;
  public tmpDisconnected = false;
  public isAppLoaded = false;
  public activeRender = false;
  // public useSlotPolyfill = false;
  public namespace = 'ox';
  private ids = 0;

  constructor(
    private readonly hostElmCtrl: HostElementController,
    private readonly registry: RegistryService,
    private readonly renderer: RendererService,
  ) {}

  public async onAppInit() {
    if (!this.supportsShadowDom) {
      // external peer dependency
      await import('@webcomponents/shadydom');
    }

    this.isAppLoaded = true;
  }

  public nextId() {
    return this.namespace + (this.ids++);
  }

  public setValue(elm: HostElement, memberName: string | symbol, newVal: string) {
    // get the internal values object, which should always come from the host element instance
    // create the _values object if it doesn't already exist
    let values = this.registry.values.get(elm);
    if (!values) {
      this.registry.values.set(elm, values = {});
    }

    const oldVal = values[memberName];

    // check our new property value against our internal value
    if (newVal !== oldVal) {
      // gadzooks! the property's value has changed!!

      // set our new value!
      // https://youtu.be/dFtLONl4cNc?t=22
      values[memberName] = newVal;

      const instance = this.registry.instances.get(elm);
      if (instance) {
        // get an array of method names of watch functions to call
        /*if (_BUILD_.watchCallback) {
          const watchMethods = values[WATCH_CB_PREFIX + memberName];
          if (watchMethods) {
            // this instance is watching for when this property changed
            for (let i = 0; i < watchMethods.length; i++) {
              try {
                // fire off each of the watch methods that are watching this property
                instance[watchMethods[i]].call(instance, newVal, oldVal, memberName);
              } catch (e) {
                console.error(e);
              }
            }
          }
        }*/

        if (!this.activeRender && elm['ox-rn']) {
          // looks like this value actually changed, so we've got work to do!
          // but only if we've already rendered, otherwise just chill out
          // queue that we need to do an update, but don't worry about queuing
          // up millions cuz this function ensures it only runs once
          this.renderer.queue(elm);
        }
      }
    }
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
        // const hostElmCtrl = new HostElementController(this, this.renderer, cmpMeta, hostCtor.prototype);
        this.hostElmCtrl.create(hostCtor.prototype, cmpMeta);

        hostCtor.observedAttributes = Metadata.getMemberProps(cmpMeta)
          .map(member => (member.attr || member.memberName));

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
      .find(([tagName]) => tagName === selector)!;

    // Should I just resolve it or actually bind it?
    const instance = injector.resolve<ComponentInstance>(component);

    /*(<Injector>injector).bind(component).toSelf();
    const instance = injector.get<ComponentInstance>(component);*/

    this.registry.instances.set(elm, instance);

    return instance;
  }

  public removeEventListener(elm: Node, eventName?: string) {
    // get the unregister listener functions for this element
    const assignersUnregListeners = this.registry.unregisterListenerFns.get(elm);

    if (assignersUnregListeners) {
      // this element has unregister listeners
      if (eventName) {
        // passed in one specific event name to remove
        assignersUnregListeners[eventName] && assignersUnregListeners[eventName]();
      } else {
        // remove all event listeners
        Object.keys(assignersUnregListeners).forEach(assignersEventName => {
          assignersUnregListeners[assignersEventName] && assignersUnregListeners[assignersEventName]();
        });
      }
    }
  }

  public elementRef(elm: any, referenceName: string) {
    switch (referenceName) {
      case 'child':
        return elm.firstElementChild;

      case 'parent':
        return elm.parentElement;

      case 'body':
        return document.body;

      case 'document':
        return document;

      case 'window':
        return window;

      default:
        return elm;
    }
  }

  public addEventListener(
    assignerElm: any,
    eventName: string,
    listenerCallback: any,
    useCapture?: boolean,
    usePassive?: boolean,
    attachTo?: boolean,
  ) {
    // remember the original name before we possibly change it
    let attachToElm = assignerElm;
    let eventListener = listenerCallback;
    let assignersEventName: string;
    let splt: string[];

    // get the existing unregister listeners for
    // this element from the unregister listeners weakmap
    let assignersUnregListeners = this.registry.unregisterListenerFns.get(assignerElm);

    assignersEventName = eventName;

    if (assignersUnregListeners && assignersUnregListeners[assignersEventName]) {
      // removed any existing listeners for this event for the assigner element
      // this element already has this listener, so let's unregister it now
      assignersUnregListeners[assignersEventName]();
    }

    if (Utils.isString(attachTo)) {
      // attachTo is a string, and is probably something like
      // "parent", "window", or "document"
      // and the eventName would be like "mouseover" or "mousemove"
      attachToElm = this.elementRef(assignerElm, attachTo);

    } else if (Utils.isObject(attachTo)) {
      // we were passed in an actual element to attach to
      attachToElm = attachTo;

    } else {
      // depending on the event name, we could actually be attaching
      // this element to something like the document or window
      splt = eventName.split(':');

      if (splt.length > 1) {
        // document:mousemove
        // parent:touchend
        // body:keyup.enter
        attachToElm = this.elementRef(assignerElm, splt[0]);
        eventName = splt[1];
      }
    }

    if (attachToElm) {
      // test to see if we're looking for an exact keycode
      splt = eventName.split('.');

      if (splt.length > 1) {
        // looks like this listener is also looking for a keycode
        // keyup.enter
        eventName = splt[0];

        eventListener = (ev: any) => {
          // wrap the user's event listener with our own check to test
          // if this keyboard event has the keycode they're looking for
          if (ev.code === KEY_CODE_MAP[splt[1]]) {
            listenerCallback(ev);
          }
        };
      }

      // create the actual event listener options to use
      // this browser may not support event options
      const eventListenerOpts = {
        capture: !!useCapture,
        passive: !!usePassive
      };

      // ok, good to go, let's add the actual listener to the dom element
      attachToElm.addEventListener(eventName, eventListener, eventListenerOpts);

      if (!assignersUnregListeners) {
        // we don't already have a collection, let's create it
        this.registry.unregisterListenerFns.set(assignerElm, assignersUnregListeners = {});
      }

      // add the unregister listener to this element's collection
      assignersUnregListeners[assignersEventName] = () => {
        // looks like it's time to say goodbye
        attachToElm && attachToElm.removeEventListener(eventName, eventListener, eventListenerOpts);
        assignersUnregListeners[assignersEventName] = null;
      };
    }
  }

}