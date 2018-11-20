import { Module } from '@one/core';

import { PlatformModule } from '@ox/platform';
import { VDomService } from '@ox/vdom';

import { QueueService } from './queue.service';
import { RendererService } from './renderer.service';

@Module({
  imports: [
    PlatformModule,
    VDomService,
  ],
  providers: [
    QueueService,
    RendererService,
  ],
  exports: [
    QueueService,
    RendererService,
  ],
})
export class QueueModule {}