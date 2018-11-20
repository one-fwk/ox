import { Module } from '@one/core';
import { PlatformModule } from '@ox/platform';
import { DeclarationMetadata } from '@ox/collection';

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