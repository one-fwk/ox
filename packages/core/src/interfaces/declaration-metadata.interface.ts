import { ModuleMetadata } from '@one/core';

import { ComponentInstance } from './component.interface';
import { Abstract } from './abstract.interface';

export interface DeclarationMetadata extends ModuleMetadata {
  declarations?: Abstract<ComponentInstance>[];
}