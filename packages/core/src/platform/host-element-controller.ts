import { Injectable } from '@one/core';

import { definePropertyGetterSetter, definePropertyValue } from './proxy-members';
import { ComponentMeta, HostElement, MemberMeta } from '../interfaces';
import { PlatformService } from './platform.service';
import { RegistryService } from './registry.service';
import { MEMBER_TYPE, Metadata, parsePropertyValue, RUNTIME_ERROR } from '../collection';
import { StyleService } from '../styles';
import { QueueService, RendererService } from '../queue';
import { isDisconnected, noop } from '../util';
import { VDomService } from '../vdom';

export type AttrProps = { [attr: string]: string };

@Injectable()
export class HostElementController {
  constructor(
    private readonly platform: PlatformService,
    private readonly renderer: RendererService,
    private readonly registry: RegistryService,
    private readonly style: StyleService,
    private readonly queue: QueueService,
    private readonly vdom: VDomService,
    // private readonly cmpMeta: ComponentMeta,
    // private readonly hostElm: HostElement,
  ) {}

  private attributeChanged(hostElm: HostElement, attrProps: AttrProps, attrName: string, newVal: string) {
    // look up to see if we have a property wired up to this attribute name
    const propName = attrProps[attrName.toLowerCase()];
    if (propName) {
      // there is not need to cast the value since, it's already casted when
      // the prop is setted
      hostElm[propName] = newVal;
    }
  }

  private registerWithParentComponent(hostElm: HostElement) {
    // find the first ancestor host element (if there is one) and register
    // this element as one of the actively loading child elements for its ancestor
    let ancestorHostElement = hostElm;

    while (ancestorHostElement = ancestorHostElement.parentElement) {
      // climb up the ancestors looking for the first registered component
      // climb up the ancestors looking for the first registered component
      if (this.registry.hasCmpMeta(ancestorHostElement)) {
        // we found this elements the first ancestor host element
        // if the ancestor already loaded then do nothing, it's too late
        if (!this.registry.isCmpReady.has(hostElm)) {
          // keep a reference to this element's ancestor host element
          // elm._ancestorHostElement = ancestorHostElement;
          this.registry.ancestorHostElements.set(hostElm, ancestorHostElement);

          // ensure there is an array to contain a reference to each of the child elements
          // and set this element as one of the ancestor's child elements it should wait on
          (ancestorHostElement['ox-ld'] = ancestorHostElement['ox-ld'] || []).push(hostElm);
        }
        break;
      }
    }
  }

  private connectedCallback(hostElm: HostElement, cmpMeta: ComponentMeta) {
    // this element just connected, which may be re-connecting
    // ensure we remove it from our map of disconnected
    this.registry.isDisconnected.delete(hostElm);

    if (!this.registry.hasConnected.has(hostElm)) {
      if (!hostElm['ox-id']) {
        // assign a unique id to this host element
        // it's possible this was already given an element id
        hostElm['ox-id'] = this.platform.nextId();
      }

      this.platform.hasConnectedComponent = true;
      this.registry.processingCmp.add(hostElm);

      // first time we've connected
      this.registry.hasConnected.set(hostElm, true);

      // register this component as an actively
      // loading child to its parent component
      this.registerWithParentComponent(hostElm);

      // add to the queue to load the bundle
      // it's important to have an async tick in here so we can
      // ensure the "mode" attribute has been added to the element
      // place in high priority since it's not much work and we need
      // to know as fast as possible, but still an async tick in between
      this.queue.tick(() => {
        // start loading this component mode's bundle
        // if it's already loaded then the callback will be synchronous
        // plt.hostSnapshotMap.set(elm, initHostSnapshot(plt.domApi, cmpMeta, elm));
        // we're already all loaded up :)

        if (this.registry.isCmpLoaded.get(hostElm)) {
          // add styles to element / shadowRoot here
          // this.style.initTemplate(cmpMeta, cmpMeta.encapsulationMeta,);
        }

        this.renderer.queue(hostElm);
      });
    }
  }

  private proxyMemberMeta(hostElm: HostElement, membersMeta: MemberMeta[]) {
    // create getters/setters on the host element prototype to represent the public API
    // the setters allows us to know when data has changed so we can re-render
    const self = this;

    membersMeta.forEach(({ memberName, memberType }) => {
      const propType = Object;

      if (memberType === MEMBER_TYPE.Prop) {
        // @Prop() or @Prop({ mutable: true })
        definePropertyGetterSetter(
          hostElm,
          memberName,
          function () {
            return (self.registry.values.get(this) || {})[memberName];
          },
          function (newValue: any)  {
            // set value in component
            const value = parsePropertyValue(<any>propType, newValue);
            self.platform.setValue(this, memberName, value);
          },
        );
      } else if (memberType === MEMBER_TYPE.Method) {
        // @Method()
        // add a placeholder noop value on the host element's prototype
        // incase this method gets called before setup
        definePropertyValue(hostElm, memberName, noop);
      }
    });
  }

  private propagateComponentReady(elm: HostElement) {
    // we're no longer processing this component
    this.registry.processingCmp.delete(elm);
    const ancestorHostElement = this.registry.ancestorHostElements.get(elm);

    // load events fire from bottom to top
    // the deepest elements load first then bubbles up
    if (ancestorHostElement) {
      // ok so this element already has a known ancestor host element
      // let's make sure we remove this element from its ancestor's
      // known list of child elements which are actively loading
      const ancestorsActivelyLoadingChildren = ancestorHostElement['ox-ld'];

      if (ancestorsActivelyLoadingChildren) {
        const index = ancestorsActivelyLoadingChildren.indexOf(elm);
        if (index > -1) {
          // yup, this element is in the list of child elements to wait on
          // remove it so we can work to get the length down to 0
          ancestorsActivelyLoadingChildren.splice(index, 1);
        }

        // the ancestor's initLoad method will do the actual checks
        // to see if the ancestor is actually loaded or not
        // then let's call the ancestor's initLoad method if there's no length
        // (which actually ends up as this method again but for the ancestor)
        if (!ancestorsActivelyLoadingChildren.length) {
          ancestorHostElement['ox-init'] && ancestorHostElement['ox-init']();
        }
      }

      this.registry.ancestorHostElements.delete(elm);
    }

    // if (this.registry.onReadyCallbacks.length )
  }

  private disconnectedCallback(hostElm: HostElement) {
    // only disconnect if we're not temporarily disconnected
    // tmpDisconnected will happen when slot nodes are being relocated
    if (!this.platform.tmpDisconnected && isDisconnected(hostElm)) {

      // ok, let's officially destroy this thing
      // set this to true so that any of our pending async stuff
      // doesn't continue since we already decided to destroy this node
      // elm._hasDestroyed = true;
      this.registry.isDisconnected.set(hostElm, true);

      // double check that we've informed the ancestor host elements
      // that they're good to go and loaded (cuz this one is on its way out)
      // propagateComponentReady(hostElm);

      // since we're disconnecting, call all of the JSX ref's with null
      const vnodes = this.registry.vnodes.get(hostElm);
      this.vdom.callNodeRefs(vnodes, true);

      // detach any event listeners that may have been added
      // because we're not passing an exact event name it'll
      // remove all of this element's event, which is good
      this.platform.removeEventListener(hostElm);
      this.registry.hasListeners.delete(hostElm);

      const instance = this.registry.instances.get(hostElm);
      if (instance && instance.componentDidUnload) {
        // call the user's componentDidUnload if there is one
        instance.componentDidUnload();
      }

      // clear any references to other elements
      // more than likely we've already deleted these references
      // but let's double check there pal
      [
        this.registry.ancestorHostElements,
        this.registry.onReadyCallbacks,
        // plt.hostSnapshotMap
      ].forEach(wm => wm.delete(hostElm));
    }
  }

  private initComponentLoaded(elm: HostElement) {
    const instance = this.registry.instances.get(elm);

    if (
      instance &&
      !this.registry.isDisconnected.has(elm) &&
      (!elm['ox-ld'] || !elm['ox-ld'].length)
    ) {
      // cool, so at this point this element isn't already being destroyed
      // and it does not have any child elements that are still loading

      // all of this element's children have loaded (if any)
      this.registry.isCmpReady.set(elm, true);
      const hasCmpLoaded = this.registry.isCmpLoaded.get(elm);

      if (!hasCmpLoaded) {
        // remember that this component has loaded
        // isCmpLoaded map is useful to know if we should fire
        // the lifecycle componentDidLoad() or componentDidUpdate()
        this.registry.isCmpLoaded.set(elm, true);

        // ensure we remove any child references cuz it doesn't matter at this point
        elm['ox-ld'] = undefined;
      }

      try {
        const vnodes = this.registry.vnodes.get(elm);
        // fire off the ref if it exists
        this.vdom.callNodeRefs(vnodes);

        // fire off the user's elm.componentOnReady() callbacks that were
        // put directly on the element (well before anything was ready)
        const onReadyCallbacks = this.registry.onReadyCallbacks.get(elm);
        if (onReadyCallbacks) {
          onReadyCallbacks.forEach(cb => cb(elm));
          this.registry.onReadyCallbacks.delete(elm);
        }

        if (!hasCmpLoaded && instance.componentDidLoad) {
          // we've never loaded this component
          // fire off the user's componentDidLoad method (if one was provided)
          // componentDidLoad only runs ONCE, after the instance's element has been
          // assigned as the host element, and AFTER render() has been called
          // and all the child components have finished loading
          instance.componentDidLoad();
        } else if (instance.componentDidUpdate) {
          instance.componentDidUpdate();
        }
      } catch (e) {
        console.error(e, RUNTIME_ERROR.DidLoadError, elm);
      }

      // ( •_•)
      // ( •_•)>⌐■-■
      // (⌐■_■)

      // load events fire from bottom to top
      // the deepest elements load first then bubbles up
      this.propagateComponentReady(elm);
    }
  }

  public create(hostElm: HostElement, cmpMeta: ComponentMeta) {
    // let's wire up our functions to the host element's prototype
    // we can also inject our platform into each one that needs that api
    // note: these cannot be arrow functions cuz "this" is important here hombre
    const self = this;

    hostElm.connectedCallback = function () {
      self.connectedCallback(this, cmpMeta);
    };

    hostElm.disconnectedCallback = function () {
      self.disconnectedCallback(this);
    };

    hostElm.forceUpdate = function () {
      self.renderer.queue(this);
    };

    hostElm['ox-init'] = function () {
      self.initComponentLoaded(this);
    };

    if (cmpMeta.membersMeta) {
      const attrProps = Metadata.getMemberProps(cmpMeta)
        .reduce((attrs, { memberName, attr }) => ({
          ...attrs,
          [attr || memberName]: memberName,
        }), {} as AttrProps);

      hostElm.attributeChangedCallback = function (attrName: string, oldVal: string, newVal: string) {
        // wtf the method below doesn't get called???????
        self.attributeChanged(this, attrProps, attrName, newVal);
      };

      // add getters/setters to the host element members
      // these would come from the @Prop and @Method decorators that
      // should create the public API to this component
      this.proxyMemberMeta(hostElm, cmpMeta.membersMeta);
    }
  }
}