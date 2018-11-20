import { TestingModule } from '@one/testing';
import { ComponentMeta } from '@ox/core';

import { HostElementController } from '../host-element-controller';
import { noop } from '@ox/core/util';
import { MEMBER_TYPE } from '@ox/core/collection';

describe('HostElementController', () => {
  let hostElmCtrl: HostElementController;
  let module: TestingModule;

  /*beforeEach(async () => {
    module = await mockTestingModule();

    hostElmCtrl = module.get(HostElementController);
  });*/

  describe('attributeChanged', () => {
    it('should reflect new attr name to prop name', () => {
      const hostElmCtrl = new (<any>HostElementController)();
      hostElmCtrl.proxyMemberMeta = noop;
      const attributeChangedSpy = spyOn(<any>hostElmCtrl, 'attribute4realChanged');

      const hostElm = class extends HTMLElement {
        static observedAttributes = ['team-name'];
      } as any;

      const cmpMeta: ComponentMeta = {
        tagNameMeta: 'app-test',
        membersMeta: [
          {
            attr: 'team-name',
            memberName: 'teamName',
            memberType: MEMBER_TYPE.Prop,
            target: {} as any,
          },
        ],
      };

      hostElmCtrl.create(hostElm.prototype, cmpMeta);

      hostElm.prototype.connectedCallback = noop;
      hostElm.prototype.disconnectedCallback = noop;
      hostElm.prototype.forceUpdate = noop;
      hostElm.prototype['ox-init'] = noop;

      customElements.define('app-test', hostElm);

      const test = document.createElement('app-test');

      document.body.appendChild(test);

      test.setAttribute('team-name', 'Appwriter');

      /*expect(attributeChangedSpy).toHaveBeenCalledWith(
        HTMLElement,
        {
          'test-name': 'teamName',
        },
        'test-name',
        'Appwriter',
      );*/

      expect(test['testName']).toEqual('Appwriter');
    });
  });
});