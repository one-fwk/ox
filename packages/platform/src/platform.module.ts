import { Injector, Module, MODULE_INIT, ModuleWithProviders, Type } from '@one/core';

import { HostElementController } from './host-element-controller';
import { PlatformService } from './platform.service';
import { RegistryService } from './registry.service';
import { AbstractComponent } from '@ox/collection';
import { QueueModule } from '@ox/core/queue';

@Module({
  imports: [QueueModule],
  providers: [HostElementController, RegistryService, PlatformService],
  exports: [RegistryService, PlatformService],
})
export class PlatformModule {
  private static addComponentsFactory(components: AbstractComponent[]) {
    return (platform: PlatformService, injector: Injector) => {
      platform.addComponents(components, injector);
    };
  }

  static forFeature(components: Type<any>[]): ModuleWithProviders {
    return {
      module: PlatformModule,
      providers: [
        {
          provide: MODULE_INIT,
          useFactory: this.addComponentsFactory(components),
          deps: [PlatformService, Injector],
          multi: true,
        },
      ],
    };
  }
}