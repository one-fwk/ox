import { APP_INIT, Module } from '@one/core';

import { PlatformModule, PlatformService } from '@ox/platform';

@Module({
  imports: [PlatformModule],
  providers: [
    {
      provide: APP_INIT,
      useFactory: (plt: PlatformService) => plt.onAppInit(),
      deps: [PlatformService],
      multi: true,
    },
  ],
})
export class BrowserModule {}