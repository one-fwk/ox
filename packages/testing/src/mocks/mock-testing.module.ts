import { Test } from '@one/testing';

import { PlatformService } from '@ox/core/platform';
import { VDomService } from '@ox/core/vdom';

export function mockTestingModule() {
  return Test.createTestingModule({
    providers: [
      PlatformService,
      VDomService,
    ],
  }).compile();
}

export { PlatformService, VDomService };