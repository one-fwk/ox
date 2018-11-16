import { ModuleMetadata as OneModuleMetadata, Type } from '@one/core';

export interface ModuleMetadata extends OneModuleMetadata {
  declarations?: Type<any>[];
}