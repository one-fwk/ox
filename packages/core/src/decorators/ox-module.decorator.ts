import { Module } from '@one/core';

import { DeclarationMetadata } from '../interfaces';
import { PlatformModule } from '../platform';

export function OxModule(metadata: DeclarationMetadata = {}): ClassDecorator {
  return (target) => {
    Module({
      ...metadata,
      imports: [
        ...(metadata.imports || []),
        metadata.declarations && PlatformModule.forFeature(metadata.declarations),
      ],
    })(target);
  };
}