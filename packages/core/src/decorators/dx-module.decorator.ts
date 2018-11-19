import { Module } from '@one/core';
import { DeclarationMetadata } from '../interfaces';
import { PlatformModule } from '../platform';

export function DxModule(metadata: DeclarationMetadata = {}): ClassDecorator {
  return (target) => {
    Module({
      imports: [
        ...(metadata.imports || []),
        metadata.declarations && PlatformModule.forFeature(metadata.declarations),
      ],
      ...metadata,
    })(target);
  };
}