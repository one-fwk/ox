import { Test } from '@one/testing';

import { PlatformService } from '@onex/core/platform';
import { VDomService } from '@onex/core/vdom';

export function mockTestingModule() {
  return Test.createTestingModule({
    providers: [
      PlatformService,
      VDomService,
    ],
  }).compile();
}

export { PlatformService, VDomService };