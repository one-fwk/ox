import { Test } from '@one/testing';

import { ComponentRegistry } from '@onex/core/platform';
import { PatchService, RendererService } from '@onex/core/vdom';

export async function mockRenderer() {
  const test = await Test.createTestingModule({
    providers: [
      ComponentRegistry,
      PatchService,
      RendererService,
    ],
  }).compile();

  return test.get<RendererService>(RendererService);
}

export { RendererService };