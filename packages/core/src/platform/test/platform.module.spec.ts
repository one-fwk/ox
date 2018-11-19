import { Test } from '@one/testing';

import { PlatformService, PlatformModule, RegistryService } from '../';
import { Reflector } from '@one/core';
import { COMPONENT_META } from '@ox/core/collection';

describe('PlatformModule', () => {
  describe('forFeature', () => {
    it('should add components', async () => {
      class TestComponent {}

      const module = await Test.createTestingModule({
        imports: [
          PlatformModule.forFeature([TestComponent]),
        ],
      }).compile();

      const registry = module.get<RegistryService>(RegistryService);
      //const { tagNameMeta } = Reflector.get(COMPONENT_META, TestComponent);
      //expect(registry.components.has(TestComponent)).toBe(true);
    });

    /*it('should have different injectors', async () => {

    });*/
  });
});