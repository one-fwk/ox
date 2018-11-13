import { ComponentMetadata } from '../interfaces';
import { COMPONENT_METADATA } from '../tokens';
import { Injectable } from '@one/core';

export function Component(options: ComponentMetadata): ClassDecorator {
  if (options.selector.split('-').length <= 1) {
    throw new Error('Selector must be a name with a hyphen in between');
  }

  return (target) => {
    Reflect.defineMetadata(COMPONENT_METADATA, options, target);
    Injectable()(target);
  };
}