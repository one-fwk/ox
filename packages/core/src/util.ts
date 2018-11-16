import { Utils } from '@one/core';
import { ComponentMeta } from './interfaces';
import { DEFAULT_STYLE_MODE } from './constants';

export function cssToDom(css: string) {
  const style = document.createElement('style');
  style.textContent = css;
  return style;
}

export function toArray<T>(item: T): T[] {
  return Array.isArray(item) ? item : [item];
}

export const isDef = (v: any) => v != null;

export function defineName(target: any, name: string) {
  Object.defineProperty(target, 'name', {
    configurable: false,
    writable: false,
    enumerable: false,
    value: name,
  });

  return target;
}

export function getChildNodes(node: Node) {
  const children = [];

  node.childNodes.forEach(child => children.push(child));

  return children;
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
  return (Utils.isNil(value) || value === '') ? [] : value.trim().split(/\s+/);
}

export function getScopeId(cmpMeta: ComponentMeta, mode?: string) {
  return ('sc-' + cmpMeta.tagNameMeta) + ((mode && mode !== DEFAULT_STYLE_MODE) ? '-' + mode : '');
}


export function getElementScopeId(scopeId: string, isHostElement?: boolean) {
  return scopeId + (isHostElement ? '-h' : '-s');
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