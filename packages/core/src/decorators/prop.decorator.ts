import { MetadataStorage } from '../metadata-storage';

export function Prop(name?: string): PropertyDecorator {
  return (target: object, propertyKey: string) => {
    MetadataStorage.props.add({
      target: target.constructor,
      name: name || propertyKey,
      propertyKey,
    });
  };
}