import { MockHostElement, createHostElementMocker } from '@ox/testing';
import { RegistryService, HostElementController } from '@ox/platform';
import {
  ComponentMeta,
  MEMBER_TYPE,
  isDisconnected,
  noop,
} from '@ox/collection';

describe('HostElementController', () => {
  let cmpMeta: ComponentMeta;
  let hostElmCtrl: any;
  let hostElm: any;
  let mockHostElement: MockHostElement;

  beforeEach(() => {
    hostElmCtrl = new (<any>HostElementController)();
    hostElm = class extends HTMLElement {};
    mockHostElement = createHostElementMocker(hostElmCtrl, hostElm);
  });

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

      const elm = mockHostElement(cmpMeta, {
        disconnectedCallback: false,
        connectedCallback() {
          hostElmCtrl.registry.instances.set(this, instance);
        }
      });

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
    beforeEach(() => {
      hostElm = class extends HTMLElement {
        static observedAttributes = ['team-name'];
      } as any;
      mockHostElement = createHostElementMocker(hostElmCtrl, hostElm);
      hostElmCtrl.proxyMemberMeta = noop;
    });

    it('should reflect new attr name to prop name', () => {
      const attributeChangedSpy = spyOn(hostElmCtrl, 'attributeChanged');

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
      const elm = mockHostElement(cmpMeta, {
        attributeChangedCallback: false,
      });

      elm.setAttribute('team-name', 'Appwriter');

      // This fails somehow ?
      // expect(attributeChangedSpy).toHaveBeenCalled();
      expect(attributeChangedSpy).toHaveBeenCalledWith(
        elm,
        {
          'test-name': 'teamName',
        },
        'test-name',
        'Appwriter',
      );
    });
  });
});