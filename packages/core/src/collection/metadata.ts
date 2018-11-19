import { BaseMetadataStorage, Reflector, Type } from '@one/core';

import { AbstractComponent, ComponentMeta, EventMeta, ListenMeta } from '../interfaces';
import { COMPONENT_META } from './tokens';

export class Metadata extends BaseMetadataStorage {
  static events = new Set<EventMeta>();
  static listeners = new Set<ListenMeta>();
  static watchers = new Set();
  static methods = new Set();
  static states = new Set();
  static props = new Set();

  static getEvents(component: Type<any>) {
    return this.filterByTarget(this.events, component);
  }

  static getListeners(component: Type<any>) {
    return this.filterByTarget(this.listeners, component);
  }

  static getWatchers(component: Type<any>) {
    return this.filterByTarget(this.watchers, component);
  }

  static getMethods(component: Type<any>) {
    return this.filterByTarget(this.methods, component);
  }

  static getStates(component: Type<any>) {
    return this.filterByTarget(this.states, component);
  }

  static getProps(component: Type<any>) {
    return this.filterByTarget(this.props, component);
  }

  static getComponentMetadata(component: AbstractComponent) {
    const componentDecoratorMeta = Reflector.get(COMPONENT_META, component);
    const listenersMeta = this.getListeners(component);
    const eventsMeta = this.getEvents(component);

    return {
      ...componentDecoratorMeta,
      listenersMeta,
      eventsMeta,
    } as ComponentMeta;
  }
}