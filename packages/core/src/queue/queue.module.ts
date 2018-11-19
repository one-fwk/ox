import { Module } from '@one/core';

import { PlatformModule } from '../platform';
import { QueueService } from './queue.service';
import { RendererService } from './renderer.service';
import { VDomService } from '../vdom';

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