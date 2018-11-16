/**
 * Production h() function based on Preact by
 * Jason Miller (@developit)
 * Licensed under the MIT License
 * https://github.com/developit/preact/blob/master/LICENSE
 *
 * Modified for Stencil's compiler and vdom
 */

import { VNode, FunctionalComponent, FunctionalUtilities, ChildType, PropsType } from '../interfaces';

const stack: any[] = [];

const utils: FunctionalUtilities = {
  'forEach': (children, cb) => children.forEach(cb),
  'map': (children, cb) => children.map(cb)
};

export function h(nodeName: string | FunctionalComponent, vnodeData: PropsType, child?: ChildType): VNode;
export function h(nodeName: string | FunctionalComponent, vnodeData: PropsType, ...children: ChildType[]): VNode;
export function h(nodeName: any, vnodeData: any) {
  let children: any[] = null;
  let lastSimple = false;
  let simple = false;
  let i = arguments.length;
  let vkey: any;
  let vname: string;

  for (; i-- > 2;) {
    stack.push(arguments[i]);
  }

  while (stack.length > 0) {
    let child = stack.pop();
    if (child && child.pop !== undefined) {
      for (i = child.length; i--;) {
        stack.push(child[i]);
      }

    } else {
      if (typeof child === 'boolean') {
        child = null;
      }

      if ((simple = typeof nodeName !== 'function')) {
        if (child == null) {
          child = '';
        } else if (typeof child === 'number') {
          child = String(child);
        } else if (typeof child !== 'string') {
          simple = false;
        }
      }

      if (simple && lastSimple) {
        (children[children.length - 1] as VNode).vtext += child;

      } else if (children === null) {
        children = [simple ? { vtext: child } as VNode : child];

      } else {
        children.push(simple ? { vtext: child } as VNode : child);
      }

      lastSimple = simple;
    }
  }

  if (vnodeData != null) {
    // normalize class / classname attributes
    if (vnodeData['className']) {
      vnodeData['class'] = vnodeData['className'];
    }

    if (typeof vnodeData['class'] === 'object') {
      for ((i as any) in vnodeData['class']) {
        if (vnodeData['class'][i]) {
          stack.push(i);
        }
      }

      vnodeData['class'] = stack.join(' ');
      stack.length = 0;
    }

    if (vnodeData.key != null) {
      vkey = vnodeData.key;
    }

    if (vnodeData.name != null) {
      vname = vnodeData.name;
    }
  }

  if (typeof nodeName === 'function') {
    // nodeName is a functional component
    return (nodeName as FunctionalComponent<any>)(vnodeData, children || [], utils);
  }

  return {
    vtag: nodeName,
    vchildren: children,
    vtext: undefined,
    vattrs: vnodeData,
    vkey: vkey,
    vname: vname,
    elm: undefined,
    ishost: false
  } as VNode;
}