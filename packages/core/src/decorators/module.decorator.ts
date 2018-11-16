import { Module as OneModule } from '@one/core';
import { ModuleMetadata } from '../interfaces';
import { COMPONENTS } from '../tokens';

export function Module(metadata: ModuleMetadata = {}): ClassDecorator {
  return (target) => {
    OneModule({
      providers: [
        ...(metadata.providers || []),
        metadata.declarations && {
          provide: COMPONENTS,
          useValue: metadata.declarations,
          multi: true,
        },
      ],
      ...metadata,
    })(target);
  };
}