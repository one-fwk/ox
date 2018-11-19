import { Injector, Module, MODULE_INIT, ModuleWithProviders, Type } from '@one/core';

import { PlatformService } from './platform.service';
import { RegistryService } from './registry.service';
import { AbstractComponent } from '../interfaces';
import { QueueModule } from '../queue';

@Module({
  imports: [QueueModule],
  providers: [RegistryService, PlatformService],
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