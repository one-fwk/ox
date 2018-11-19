import { ComponentInstance } from './component.interface';

export interface Abstract<T> {
  new (...args: any[]): T;
  prototype: T;
}

export interface AbstractComponent extends Abstract<ComponentInstance> {}