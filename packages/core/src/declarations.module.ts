import { DynamicModule, Injector, Module, MODULE_INIT } from '@one/core';
import { AbstractComponent, DeclarationMetadata } from '@ox/collection';
import { PlatformModule, PlatformService } from '@ox/platform';

@Module(/*{
  imports: [PlatformModule],
}*/)
export class DeclarationsModule {
  private static addComponentsFactory(components: AbstractComponent[]) {
    return (platform: PlatformService, injector: Injector) => {
      platform.addComponents(components, injector);
    };
  }

  static register(metadata: DeclarationMetadata): DynamicModule {
    return {
      module: DeclarationsModule,
      imports: [PlatformModule],
      providers: [
        ...(metadata.providers || []),
        {
          provide: MODULE_INIT,
          useFactory: this.addComponentsFactory(metadata.declarations),
          deps: [PlatformService, Injector],
          multi: true,
        },
      ],
    };
  }
}