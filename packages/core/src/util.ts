import { ComponentMeta } from './interfaces';
import { DEFAULT_STYLE_MODE, NODE_TYPE } from './collection';

export const isDef = (v: any) => v != null;

export function expectClasses(elm: Element, classes: string[]) {
  return expect(elm.className.split(' '))
    .toEqual(jasmine.arrayContaining(classes));
}

export async function expectError(fn: () => Promise<any>, expected = Error) {
  let error;
  try {
    await fn();
  } catch (e) {
    error = e;
  }

  return expect(error).toEqual(jasmine.any(expected));
}

export function parseClassList(value: string | undefined | null): string[] {
  return (!value || value === '') ? [] : value.trim().split(/\s+/);
}

export function getScopeId(cmpMeta: ComponentMeta, mode?: string) {
  return ('sc-' + cmpMeta.tagNameMeta) + ((mode && mode !== DEFAULT_STYLE_MODE) ? '-' + mode : '');
}

export function getElementScopeId(scopeId: string, isHostElement?: boolean) {
  return scopeId + (isHostElement ? '-h' : '-s');
}

export function isDisconnected(elm: Node) {
  while (elm) {
    if (!elm.parentNode) {
      return elm.nodeType !== NODE_TYPE.DocumentNode;
    }
    elm = elm.parentNode;
  }
}

/**
 * Attempt to set a DOM property to the given value.
 * IE & FF throw for certain property-value combinations.
 */
export function setProperty(elm: any, name: string, value: any) {
  try {
    elm[name] = value;
  } catch (e) { }
}

export function noop() {}