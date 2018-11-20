import { Metadata } from '../collection';

export function Watch(property: string): MethodDecorator {
  return (target, propertyKey) => {
    Metadata.watchers.add({
      target: target.constructor,
      propertyKey,
      property,
    });
  };
}