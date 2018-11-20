import { Injectable, Reflector } from '@one/core';

import { COMPONENT_META, ENCAPSULATION, getStylesMeta } from '../collection';
import { ComponentMeta, ComponentOptions } from '../interfaces';

export function Component(options: ComponentOptions): ClassDecorator {
  if (!options.selector || options.selector.trim() === '') {
    throw new Error(`tag missing in component decorator: ${JSON.stringify(options, null, 2)}`);
  }

  const cmpMeta: ComponentMeta = {
    tagNameMeta: options.selector,
    stylesMeta: getStylesMeta(options),
    // normalizeEncapsulation
    encapsulationMeta:
      options.shadow ? ENCAPSULATION.ShadowDom :
        options.scoped ? ENCAPSULATION.ScopedCss :
          ENCAPSULATION.NoEncapsulation,
  };

  return (target) => {
    Reflector.set(COMPONENT_META, cmpMeta, target);
    Injectable()(target);
  };
}