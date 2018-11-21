import { HostElementController } from '@ox/platform';
import { ComponentMeta } from '@ox/collection';

export interface MockMethods {
  [methodName: string]: Function | boolean;
}

export type MockHostElement = (cmpMeta: ComponentMeta, mocks?: MockMethods) => any;

export function createHostElementMocker(hostElmCtrl: HostElementController, hostElm: any) {
  return (cmpMeta: ComponentMeta, mocks: MockMethods = {}) => {
    hostElmCtrl.create(hostElm.prototype, cmpMeta);

    [
      'forceUpdate',
      'ox-init',
      'connectedCallback',
      'attributeChangedCallback',
      'disconnectedCallback',
    ].forEach(methodName => {
      if (mocks[methodName] === false) return;

      hostElm.prototype[methodName] = mocks[methodName] || jasmine.createSpy(methodName);
    });

    customElements.define(cmpMeta.tagNameMeta, hostElm);

    const elm = document.createElement(cmpMeta.tagNameMeta);

    document.body.appendChild(elm);

    return elm;
  };
}