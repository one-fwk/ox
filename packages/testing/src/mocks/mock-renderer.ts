import { Test } from '@one/testing';

import { ComponentRegistry, PlatformService } from '@onex/core/platform';
import { VDomService } from '@onex/core/vdom';

export function mockTestingModule() {
  return Test.createTestingModule({
    providers: [
      ComponentRegistry,
      PlatformService,
      VDomService,
    ],
  }).compile();
}

export { ComponentRegistry, PlatformService, VDomService };