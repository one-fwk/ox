import { Injectable, Injector } from '@one/core';
import { AbstractComponent, ComponentInstance, ComponentMeta, HostElement, VNode } from '../interfaces';

@Injectable()
export class RegistryService {
  public readonly components = new Map<string, [AbstractComponent, Injector]>();
  public readonly instances = new WeakMap<HostElement, ComponentInstance>();
  public readonly ancestorHostElements = new WeakMap<HostElement, HostElement>();
  public readonly hasConnected = new WeakMap<HostElement, boolean>();
  public readonly hasListeners = new WeakMap<HostElement, boolean>();
  public readonly isCmpLoaded = new WeakMap<HostElement, boolean>();
  public readonly isDisconnected = new WeakMap<HostElement, boolean>();
  public readonly queuedEvents = new WeakMap<HostElement, any[]>();
  public readonly vnodes = new WeakMap<HostElement, VNode>();
  public readonly cmpMeta = new Map<string, ComponentMeta>();
  public readonly hostElements = new WeakMap<ComponentInstance, HostElement>();
  public readonly values = new WeakMap<HostElement, any>();
  public readonly processingCmp = new Set<HostElement>();

  public setCmpMeta(elm: HostElement | Element, meta: ComponentMeta) {
    this.cmpMeta.set(elm.tagName, meta);
  }

  public hasCmpMeta(elm: HostElement | Element) {
    return this.cmpMeta.has(elm.tagName);
  }

  public getCmpMeta(elm: HostElement | Element) {
    return this.cmpMeta.get(elm.tagName);
  }
}