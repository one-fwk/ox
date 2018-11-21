import { Reflector } from '@one/core';
import { Test } from '@one/testing';

import { RegistryService} from '@ox/platform';
import { COMPONENT_META } from '@ox/collection';
import { DeclarationsModule } from '@ox/core';
import { Component } from '../';

describe('@OxModule()', () => {
  it('should add components if declarations are provided', async () => {
    @Component({
      selector: 'app-test'
    })
    class TestComponent {}

    const module = await Test.createTestingModule({
      imports: [
        DeclarationsModule.register({
          declarations: [TestComponent],
        })
      ],
    }).compile();

    const registry = module.get<RegistryService>(RegistryService);
    const { tagNameMeta } = Reflector.get(COMPONENT_META, TestComponent);

    expect(tagNameMeta).toEqual('app-test');
    expect(registry.components.has(tagNameMeta)).toBe(true);
  });
});