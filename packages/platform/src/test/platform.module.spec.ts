import { Test } from '@one/testing';

import { PlatformService, PlatformModule, RegistryService } from '@ox/platform';

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