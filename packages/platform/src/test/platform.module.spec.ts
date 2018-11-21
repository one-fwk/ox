import { Test } from '@one/testing';

import { PlatformService, RegistryService } from '@ox/platform';
import { DeclarationsModule } from '@ox/core';

describe('PlatformModule', () => {
  describe('forFeature', () => {
    it('should add components', async () => {
      class TestComponent {}

      const module = await Test.createTestingModule({
        imports: [
          DeclarationsModule.register({
            declarations: [TestComponent],
          }),
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