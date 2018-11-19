import { Module } from '@one/core';

import { PlatformModule } from '../platform';
import { QueueClient } from './queue-client.service';
import { Queue } from './queue.service';

@Module({
  imports: [PlatformModule],
  providers: [
    QueueClient,
    Queue,
  ],
  exports: [
    QueueClient,
    Queue,
  ],
})
export class QueueModule {}