/*import { BaseMetadataStorage, Type } from '@one/core';

import { PropMetadata, ElementMetadata, StateMetadata, ViewChildMetadata } from './interfaces';
import { COMPONENT_METADATA } from './tokens';

export class MetadataStorage extends BaseMetadataStorage {
  static elements = new Set<ElementMetadata>();
  static states = new Set<StateMetadata>();
  static props = new Set<PropMetadata>();
  static viewChildren = new Set<ViewChildMetadata>();

  static getElementRef(target: Type<any>) {
    return this.findByTarget(this.elements, target);
  }

  static getViewChildren(target: Type<any>) {
    return this.filterByTarget(this.viewChildren, target);
  }

  static getStates(target: Type<any>) {
    return this.filterByTarget(this.states, target);
  }

  static getPropByName(target: Type<any>, name: string) {
    return this.getProps(target).find(prop => prop.name === name);
  }

  static getProps(target: Type<any>) {
    return this.filterByTarget(this.props, target);
  }

  static getComponent(target: Type<any>) {
    return Reflect.getMetadata(COMPONENT_METADATA, target);
  }

  static flush() {
    this.states.clear();
    this.props.clear();
    this.elements.clear();
  }
}*/