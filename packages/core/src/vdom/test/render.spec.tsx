import { mockTestingModule, PlatformService, VDomService } from '@onex/testing';
import { HostElement } from '@onex/core/interfaces';

describe('instance render', () => {
  let hostElm: HostElement;
  let vdom: VDomService;
  let plt: PlatformService;

  beforeEach(async () => {
    hostElm = document.createElement('ion-tag');
    const test = await mockTestingModule();
    vdom = test.get(VDomService);
    plt = test.get(PlatformService);
  });

  it('should reflect standardized boolean attribute, falsy by removing attr, no render()', () => {
    class MyComponent {
      checked = false;

      static properties = {
        checked: {
          type: Boolean,
          attr: 'checked',
          reflectToAttr: true,
        },
      };
    }
  });
});