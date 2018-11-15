import { MetadataStorage } from '../metadata-storage';

export function Element(): PropertyDecorator {
  return (target, propertyKey) => {
    MetadataStorage.elements.add({
      target: target.constructor,
      propertyKey,
    });
  };
}