import { Metadata } from '@ox/collection';

export function Watch(property: string): MethodDecorator {
  return (target, propertyKey) => {
    Metadata.watchers.add({
      target: target.constructor,
      propertyKey,
      property,
    });
  };
}