import { DynamicModule, Module, MODULE_INIT } from '@one/core';

import { PlatformModule, PlatformService } from '@ox/platform';
import { BrowserOptions } from './browser-options.interface';

@Module()
export class BrowserModule {
  static forRoot(options: BrowserOptions): DynamicModule {
    return {
      module: BrowserModule,
      imports: [PlatformModule],
      providers: [
        {
          provide: MODULE_INIT,
          useFactory: (plt: PlatformService) => plt.onBrowserInit(options),
          deps: [PlatformService],
          multi: true,
        },
      ],
    };
  }
}