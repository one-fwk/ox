import { Module, ModuleMetadata } from '@one/core';
import { DeclarationMetadata } from '@ox/collection';
import { DeclarationsModule } from '@ox/core';

export function OxModule(metadata: DeclarationMetadata = {}): ClassDecorator {
  return (target) => {
    let oxMetadata: ModuleMetadata = {};

    if (metadata.declarations) {
      oxMetadata.imports = [DeclarationsModule.register(metadata)];

      // if anything should be exported
      if (metadata.exports) {
        oxMetadata.imports = oxMetadata.imports.concat(metadata.imports);
        oxMetadata.providers = metadata.providers;
        oxMetadata.exports = metadata.exports;
      }
    } else {
      oxMetadata = metadata;
    }

    Module(oxMetadata)(target);
  };
}