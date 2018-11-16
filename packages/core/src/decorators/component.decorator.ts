import { Injectable, Reflector, TransientScope } from '@one/core';

import { ComponentMeta, ComponentOptions } from '../interfaces';
import { getStylesMeta } from '../collection';
import { ENCAPSULATION } from '../constants';
import { COMPONENT_META } from '../tokens';

export function Component(options: ComponentOptions): ClassDecorator {
  if (!options.selector || options.selector.trim() === '') {
    throw new Error(`tag missing in component decorator: ${JSON.stringify(options, null, 2)}`);
  }

  const cmpMeta: ComponentMeta = {
    tagNameMeta: options.selector,
    stylesMeta: getStylesMeta(options),
  };

  // normalizeEncapsulation
  cmpMeta.encapsulationMeta =
    options.shadow ? ENCAPSULATION.ShadowDom :
      options.scoped ? ENCAPSULATION.ScopedCss :
        ENCAPSULATION.NoEncapsulation;

  return (target) => {
    Reflector.set(COMPONENT_META, cmpMeta, target);
    TransientScope()(target);
    Injectable()(target);
  };
}