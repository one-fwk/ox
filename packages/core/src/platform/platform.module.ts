import {
  DynamicModule,
  Injector,
  Module,
  MODULE_INIT,
  ModuleWithProviders,
} from '@one/core';

import { PlatformService } from './platform.service';
import { Abstract, ComponentInstance } from '../interfaces';

/*@Module()
class PlatformMainModule implements OnModuleInit {
  constructor(
    private readonly container: OneContainer,
  ) {}

  onModuleInit() {
    this.pltMain.create(this.container);
  }
}*/

@Module({
  providers: [PlatformService],
  exports: [PlatformService],
})
export class PlatformModule {
  private static addComponentsFactory(components: Abstract<ComponentInstance>[]) {
    return (plt: PlatformService, injector: Injector) => {
      plt.addComponents(components, injector);
    };
  }

  static forFeature(components: Abstract<ComponentInstance>[]): ModuleWithProviders {
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

  /*static forRoot(namespace: string): DynamicModule {
    return {
      module: PlatformMainModule,
      imports: [PlatformModule],
      providers: [
        PlatformMainService,
        {
          provide: PLATFORM_OPTIONS,
          useValue: namespace,
        }
      ],
    };
  }*/
}