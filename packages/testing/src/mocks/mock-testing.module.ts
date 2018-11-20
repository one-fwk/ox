import { Test } from '@one/testing';

import { PlatformModule, PlatformService } from '@ox/core/platform';
import { VDomService } from '@ox/core/vdom';
import { QueueModule } from '@ox/core/queue';
import { StyleService } from '@ox/core/styles';
import { BrowserModule } from '@ox/core';

export function mockTestingModule() {
  return Test.createTestingModule({
    imports: [
      PlatformModule,
      BrowserModule,
    ],
    providers: [
      QueueModule,
      StyleService,
      VDomService,
    ],
  }).compile();
}

export { PlatformService, VDomService };