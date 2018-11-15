import { Module } from '@one/core';

import { ControllerComponents, ComponentRegistry } from './maps';
// import { PlatformMainService } from './platform-main.service';

const platformProviders = [
  ComponentRegistry,
  ControllerComponents,
  // PlatformMainService,
];

@Module({
  providers: platformProviders,
  exports: platformProviders,
})
export class PlatformModule {}