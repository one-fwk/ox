import {createHostElementMocker, MockHostElement} from '@ox/testing';
import {HostElementController, RegistryService} from '@ox/platform';
import {ComponentDidUnload, ComponentMeta, isDisconnected, MEMBER_TYPE, noop,} from '@ox/collection';

describe('HostElementController', () => {
  let cmpMeta: ComponentMeta;
  let hostElmCtrl: any;
  let hostElm: any;
  let mockHostElement: MockHostElement;

  beforeEach(() => {
    hostElmCtrl = new (<any>HostElementController)();
    hostElm = class extends HTMLElement {};
    mockHostElement = createHostElementMocker(hostElmCtrl, hostElm);
    cmpMeta = {} as any;
  });

  describe('initHostSnapshot', () => {
    it('should set attributes', () => {
      cmpMeta.tagNameMeta = 'host-snapshot-attr';
      cmpMeta.membersMeta = [
        {
          memberName: 'first',
          attrName: 'first',
          memberType: MEMBER_TYPE.Prop,
        },
        {
          memberName: 'lastName',
          attrName: 'last-name',
          memberType: MEMBER_TYPE.Prop,
        },
      ] as any;

      const elm = mockHostElement(cmpMeta);

      elm.setAttribute('dont-care', 'true');
      elm.setAttribute('first', 'Marty');
      elm.setAttribute('last-name', 'McFly');

      const snapshot = hostElmCtrl.initHostSnapshot(elm, cmpMeta);
      expect(snapshot.$attributes['dont-care']).toBeUndefined();
      expect(snapshot.$attributes['first']).toEqual('Marty');
      expect(snapshot.$attributes['last-name']).toEqual('McFly');
    });
  });

  describe('disconnectedCallback', () => {
    beforeEach(() => {
      hostElmCtrl.proxyMemberMeta = noop;
      hostElmCtrl.registry = new RegistryService();
      hostElmCtrl.platform = {
        tmpDisconnected: false,
        removeEventListener: noop,
      };
      hostElmCtrl.vdom = {
        callNodeRefs: noop,
      };
    });

    it('should disconnect and call with element', () => {
      const disconnectedCallbackSpy = spyOn(hostElmCtrl, 'disconnectedCallback');

      cmpMeta = {
        tagNameMeta: 'app-test-disconnected',
      };

      const elm = mockHostElement(cmpMeta, {
        disconnectedCallback: false,
      });

      elm.remove();

      expect(isDisconnected(elm)).toBe(true);
      expect(disconnectedCallbackSpy).toHaveBeenCalledWith(elm);
    });

    it('should call componentDidUnload on component instance', () => {
      const componentDidUnload = jasmine.createSpy('componentDidUnload');

      const instance: ComponentDidUnload = { componentDidUnload };

      cmpMeta = {
        tagNameMeta: 'app-test-disconnected-did-unload',
      };

      const elm = mockHostElement(cmpMeta, {
        disconnectedCallback: false,
        connectedCallback() {
          hostElmCtrl.registry.instances.set(this, instance);
        }
      });

      elm.remove();

      expect(isDisconnected(elm)).toBe(true);
      expect(componentDidUnload).toHaveBeenCalled();
    });
  });

  describe('connectedCallback', () => {
    it('should call with element and component metadata', () => {
      hostElmCtrl.proxyMemberMeta = noop;
      hostElmCtrl.connectedCallback = jasmine.createSpy('connectedCallback');

      cmpMeta = {
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
      cmpMeta = {
        membersMeta: [
          {
            attrName: 'team-name',
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