import { Type } from '@one/core';
import { MetadataStorage } from '../metadata-storage';

export function ViewChild(child: Type<any>): PropertyDecorator {
  return (target, propertyKey) => {
    MetadataStorage.viewChildren.add({
      target: target.constructor,
      propertyKey,
      child,
    });
  };
}