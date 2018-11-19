import { Test } from '@one/testing';

import { PlatformModule } from '../platform.module';
import { PlatformService } from '../platform.service';

describe('PlatformModule', () => {
  describe('forFeature', () => {
    it('should add components', async () => {
      class TestComponent {}

      const module = await Test.createTestingModule({
        imports: [
          PlatformModule.forFeature([TestComponent]),
        ],
      }).compile();

      const plt = module.get<PlatformService>(PlatformService);
      expect(plt.components.has(TestComponent)).toBe(true);
    });

    /*it('should have different injectors', async () => {

    });*/
  });
});