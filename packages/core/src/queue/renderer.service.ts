import { Injectable } from '@one/core';

import { PlatformService, RegistryService } from '@ox/platform';
import { VDomService } from '@ox/vdom';
import { QueueService } from './queue.service';
import { EventEmitter } from './event-emitter';
import {
  MEMBER_TYPE,
  Metadata,
  RUNTIME_ERROR,
  parsePropertyValue,
  definePropertyGetterSetter,
  isDef,
  ComponentInstance,
  ComponentMeta,
  HostElement,
  HostSnapshotAttributes,
  MemberMeta,
} from '@ox/collection';

@Injectable()
export class RendererService {
  constructor(
    private readonly queueClient: QueueService,
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
      if (this.platform.isBrowserLoaded) {
        // app has already loaded
        // let's queue this work in the dom write phase
        this.queueClient.write(() => this.update(elm));
      } else {
        // app hasn't finished loading yet
        // so let's use next tick to do everything
        // as fast as possible
        this.queueClient.tick(() => this.update(elm));
      }
    }
  }

  private initEventEmitters(
    instance: ComponentInstance,
    cmpMeta: ComponentMeta,
    hostElm: HostElement,
  ) {
    Metadata.getMemberEvents(cmpMeta).forEach(memberMeta => {
      instance[memberMeta.memberName] = new EventEmitter(this.platform, memberMeta, hostElm);
    });
  }

  private defineMember(
    memberMeta: MemberMeta,
    hostElm: HostElement,
    instance: ComponentInstance,
    hostAttributes?: HostSnapshotAttributes,
    hostAttrValue?: string,
  ) {
    const hostSnapshot = this.registry.hostSnapshots.get(hostElm);
    const { memberName, memberType, attrName, mutable } = memberMeta;
    const self = this;

    function getComponentProp() {
      // component instance prop/state getter
      // get the property value directly from our internal values
      const values = self.registry.values.get(this);
      return values && values[memberName];
    }

    function setComponentProp(newValue: any) {
      // component instance prop/state setter (cannot be arrow fn)
      if (this) {
        if (memberType === MEMBER_TYPE.State || (memberType === MEMBER_TYPE.Prop && mutable)) {
          self.platform.setValue(this, memberName, newValue);
        } else {
          console.warn(`@Prop() "${memberName}" on "${this.tagName}" cannot be modified.`);
        }
      }
    }

    if (memberType & (MEMBER_TYPE.Prop | MEMBER_TYPE.State)) {
      const values = this.registry.values.get(hostElm);

      if (memberType === MEMBER_TYPE.Prop) {
        if (attrName && (values[memberName]) === undefined || values[memberName] === '') {
          // check the prop value from the host element attribute
          if (
            (hostAttributes = hostSnapshot && hostSnapshot.$attributes) &&
            isDef(hostAttrValue = hostAttributes[attrName])
          ) {
            // looks like we've got an attribute value
            // let's set it to our internal values
            values[memberName] = parsePropertyValue(null, hostAttrValue);
          }
        }

        if (hostElm.hasOwnProperty(memberName)) {
          // @Prop or @Prop({mutable:true})
          // property values on the host element should override
          // any default values on the component instance
          if (values[memberName] === undefined) {
            const attrValue = (<HTMLElement>hostElm).getAttribute(memberName);
            values[memberName] = parsePropertyValue(null, attrValue);
          }

          // for the client only, let's delete its "own" property
          // this way our already assigned getter/setter on the prototype kicks in
          // the very special case is to NOT do this for "mode"
          if (memberName !== 'mode') {
            (<HTMLElement>hostElm).removeAttribute(memberName);
          }
        }
      }

      if (instance.hasOwnProperty(memberName) && values[memberName] === undefined) {
        // @Prop() or @Prop({mutable:true}) or @State()
        // we haven't yet got a value from the above checks so let's
        // read any "own" property instance values already set
        // to our internal value as the source of getter data
        // we're about to define a property and it'll overwrite this "own" property
        values[memberName] = instance[memberName];
      }

      // add getter/setter to the component instance
      // these will be pointed to the internal data set from the above checks
      definePropertyGetterSetter(
        instance,
        memberName,
        getComponentProp,
        setComponentProp,
      );

    } else if (memberType === MEMBER_TYPE.Element) {

    } else if (memberType === MEMBER_TYPE.Method) {

    }
  }

  private proxyComponentInstance(
    instance: ComponentInstance,
    hostElm: HostElement,
  ) {
    // at this point we've got a specific node of a host element, and created a component class instance
    // and we've already created getters/setters on both the host element and component class prototypes
    // let's upgrade any data that might have been set on the host element already
    // and let's have the getters/setters kick in and do their jobs

    // let's automatically add a reference to the host element on the instance
    this.registry.hostElements.set(instance, hostElm);

    // create the values object if it doesn't already exist
    // this will hold all of the internal getter/setter values
    if (!this.registry.values.has(hostElm)) {
      this.registry.values.set(hostElm, {});
    }

    // get the properties
    // and add default "mode" and "color" properties


  }

  private async update(elm: HostElement) {
    // no longer queued for update
    // this.plt.reg.isQueuedForUpdate.delete(elm);

    if (!this.registry.isDisconnected.has(elm)) {
      const cmpMeta = this.registry.getCmpMeta(elm)!;
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

        this.proxyComponentInstance(instance, elm);
        this.initEventEmitters(instance, cmpMeta, elm);

        if (instance.componentWillLoad) {
          try {
            await instance.componentWillLoad();
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

      elm['ox-init']!();
      /*
      if (_BUILD_.hotModuleReplacement) {
        elm['s-hmr-load'] && elm['s-hmr-load']();
      }
      */
    }
  }
}