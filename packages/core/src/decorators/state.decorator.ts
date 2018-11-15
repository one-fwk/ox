import { MetadataStorage } from '../metadata-storage';

export function State(): PropertyDecorator {
  return (target: any, propertyKey) => {
    MetadataStorage.states.add({
      propertyKey,
      target,
    });
  };
}