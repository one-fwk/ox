/**
 * Modified from Stencil
 *
 * Licensed under the MIT License
 * https://github.com/ionic-team/stencil/blob/master/LICENSE
 */
import { Utils } from '@one/core';

import { ChildType, FunctionalComponent, FunctionalUtilities, PropsType, VNode } from '../interfaces';

const stack: any[] = [];

const utils: FunctionalUtilities = {
  forEach: (children, cb) => children.forEach(cb),
  map: (children, cb) => children.map(cb),
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
    if (child && Utils.isFunction(child.pop)) {
      for (i = child.length; i--;) {
        stack.push(child[i]);
      }
    } else {
      if (Utils.isBoolean(child)) {
        child = null;
      }

      if ((simple = !Utils.isFunction(nodeName))) {
        if (Utils.isNil(child)) {
          child = '';
        } else if (Utils.isNumber(child)) {
          child = String(child);
        } else if (!Utils.isString(child)) {
          simple = false;
        }
      }

      if (simple && lastSimple) {
        (children[children.length - 1] as VNode).vtext += child;
      } else if (Utils.isNil(children)) {
        children = [simple ? { vtext: child } as VNode : child];
      } else {
        children.push(simple ? { vtext: child } as VNode : child);
      }

      lastSimple = simple;
    }
  }

  if (!Utils.isNil(vnodeData)) {
    // normalize class / className attributes
    if (vnodeData['className']) {
      vnodeData['class'] = vnodeData['className'];
    }

    if (Utils.isObject(vnodeData['class'])) {
      Object.keys(vnodeData['class']).forEach(i => {
        stack.push(i);
      });

      vnodeData['class'] = stack.join(' ');
      stack.length = 0;
    }

    if (!Utils.isNil(vnodeData.key)) {
      vkey = vnodeData.key;
    }

    if (!Utils.isNil(vnodeData.name)) {
      vname = vnodeData.name;
    }
  }

  if (Utils.isFunction(nodeName)) {
    // nodeName is a functional component
    return (nodeName as FunctionalComponent<any>)(vnodeData, children || [], utils);
  }

  return {

  };
}