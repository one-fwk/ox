import { ComponentMeta } from '@ox/core';

import { HostElementController } from '../host-element-controller';
import { isDisconnected, noop } from '@ox/core/util';
import { MEMBER_TYPE } from '@ox/core/collection';
import { RegistryService } from '@ox/core/platform';

describe('HostElementController', () => {
  let cmpMeta: ComponentMeta;
  let hostElmCtrl: any;
  let hostElm: any;

  beforeEach(() => {
    hostElmCtrl = new (<any>HostElementController)();
    hostElm = class extends HTMLElement {};
  });

  function mockHostElement(cmpMeta: ComponentMeta, hostMock = {}) {
    hostElmCtrl.create(hostElm.prototype, cmpMeta);

    [
      'forceUpdate',
      'ox-init',
      'connectedCallback',
      'attributeChangedCallback',
      'disconnectedCallback',
    ].forEach(methodName => {
      hostElm.prototype[methodName] = hostMock[methodName] || noop;
    });

    customElements.define(cmpMeta.tagNameMeta, hostElm);

    const elm = document.createElement(cmpMeta.tagNameMeta);

    document.body.appendChild(elm);

    return elm;
  }

  describe('disconnectedCallback', () => {
    beforeEach(() => {
      hostElmCtrl.registry = new RegistryService();
      hostElmCtrl.platform = {
        tmpDisconnected: false,
        removeEventListener: noop,
      };
      hostElmCtrl.vdom = {
        callNodeRefs: noop,
      };
    });

    it('should call componentDidUnload on component instance', () => {
      hostElmCtrl.proxyMemberMeta = noop;
      const disconnectedCallbackSpy = spyOn(hostElmCtrl, 'disconnectedCallback');
      const componentDidUnloadSpy = jasmine.createSpy('componentDidUnload');

      class TestComponent {}

      (<any>TestComponent.prototype).componentDidUnload = componentDidUnloadSpy;

      const instance = new TestComponent();

      const cmpMeta: ComponentMeta = {
        tagNameMeta: 'app-test-disconnected',
      };

      hostElmCtrl.create(hostElm.prototype, cmpMeta);

      hostElm.prototype.forceUpdate = noop;
      hostElm.prototype['ox-init'] = noop;
      hostElm.prototype.connectedCallback = function () {
        hostElmCtrl.registry.instances.set(this, instance);
      };

      customElements.define(cmpMeta.tagNameMeta, hostElm);

      const elm = document.createElement('app-test-disconnected');

      document.body.appendChild(elm);

      elm.remove();

      expect(isDisconnected(elm)).toBe(true);
      expect(disconnectedCallbackSpy).toHaveBeenCalledWith(elm);
      expect(componentDidUnloadSpy).toHaveBeenCalled();
    });
  });

  describe('connectedCallback', () => {
    it('should call with element and component metadata', () => {
      hostElmCtrl.proxyMemberMeta = noop;
      hostElmCtrl.connectedCallback = jasmine.createSpy('connectedCallback');

      const cmpMeta = {
        tagNameMeta: 'app-test-connected',
      };

      const elm = mockHostElement(cmpMeta,{
        connectedCallback() {
          hostElmCtrl.connectedCallback(this, cmpMeta);
        }
      });

      expect(hostElmCtrl.connectedCallback).toHaveBeenCalledWith(elm, cmpMeta);
    });
  });

  describe('attributeChanged', () => {
    it('should reflect new attr name to prop name', () => {
      hostElmCtrl.proxyMemberMeta = noop;
      const attributeChangedSpy = spyOn(hostElmCtrl, 'attributeChanged');

      hostElm = class extends HTMLElement {
        static observedAttributes = ['team-name'];
      } as any;

      const tagNameMeta = 'app-test-attribute';
      const cmpMeta: ComponentMeta = {
        membersMeta: [
          {
            attr: 'team-name',
            memberName: 'teamName',
            memberType: MEMBER_TYPE.Prop,
            target: {} as any,
          },
        ],
        tagNameMeta,
      };

      hostElmCtrl.create(hostElm.prototype, cmpMeta);

      hostElm.prototype.connectedCallback = noop;
      hostElm.prototype.disconnectedCallback = noop;
      hostElm.prototype.forceUpdate = noop;
      hostElm.prototype['ox-init'] = noop;

      customElements.define(tagNameMeta, hostElm);

      const test = document.createElement(tagNameMeta);

      document.body.appendChild(test);

      test.setAttribute('team-name', 'Appwriter');

      // This fails somehow ?
      expect(attributeChangedSpy).toHaveBeenCalledWith(
        test,
        {
          'test-name': 'teamName',
        },
        'test-name',
        'Appwriter',
      );
    });
  });
});