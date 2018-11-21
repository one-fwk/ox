import { forwardRef, Module } from '@one/core';
import { QueueModule } from '@ox/core/queue';
import { HostElementController } from './host-element-controller';
import { PlatformService } from './platform.service';
import { RegistryService } from './registry.service';

@Module({
  imports: [
    forwardRef(() => QueueModule),
  ],
  providers: [
    HostElementController,
    RegistryService,
    PlatformService,
  ],
  exports: [
    RegistryService,
    PlatformService,
  ],
})
export class PlatformModule {}