import { DynamicModule, Module, OneContainer, OnModuleInit } from '@one/core';

import { PlatformMainService } from './platform-main.service';
import { PlatformService } from './platform.service';
import { PLATFORM_OPTIONS } from '../tokens';

@Module()
class PlatformMainModule implements OnModuleInit {
  constructor(
    private readonly pltMain: PlatformMainService,
    private readonly container: OneContainer,
  ) {}

  onModuleInit() {
    this.pltMain.create(this.container);
  }
}

@Module({
  providers: [PlatformService],
  exports: [PlatformService],
})
export class PlatformModule {
  static forRoot(namespace: string): DynamicModule {
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
  }
}