import { Test } from '@one/testing';

import { PlatformService } from '../../platform';
import { DxModule, Component } from '../';

describe('@DxModule()', () => {
  it('should add components if declarations are provided', async () => {
    @Component({
      selector: 'app-test'
    })
    class TestComponent {}

    @DxModule({
      declarations: [TestComponent],
    })
    class TestModule {}

    const module = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    const plt = module.get<PlatformService>(PlatformService);
    const { tagNameMeta } = plt.getCmpMetaFromComponent(TestComponent);
    expect(plt.components.has(tagNameMeta)).toBe(true);
  });
});