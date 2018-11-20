import { ModuleMetadata, Type } from '@one/core';

export interface DeclarationMetadata extends ModuleMetadata {
  declarations?: Type<any>[];
}