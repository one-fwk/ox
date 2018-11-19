/**
 * Production h() function based on Preact by
 * Jason Miller (@developit)
 * Licensed under the MIT License
 * https://github.com/developit/preact/blob/master/LICENSE
 *
 * Modified for Stencil's compiler and vdom
 */
import { Utils } from '@one/core';
import {
  VNode,
  FunctionalComponent,
  FunctionalUtilities,
  ChildType,
  PropsType,
} from '../interfaces';

const stack: any[] = [];

const utils: FunctionalUtilities = {
  'forEach': (children, cb) => children.forEach(cb),
  'map': (children, cb) => children.map(cb)
};

export function h(nodeName: string | FunctionalComponent, vnodeData: PropsType, child?: ChildType): VNode;
export function h(nodeName: string | FunctionalComponent, vnodeData: PropsType, ...children: ChildType[]): VNode;
export function h(nodeName: any, vnodeData: any) {
  let vchildren: any[] = null;
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
        } else if (typeof child === 'number') {
          child = String(child);
        } else if (typeof child !== 'string') {
          simple = false;
        }
      }

      if (simple && lastSimple) {
        (vchildren[vchildren.length - 1] as VNode).vtext += child;

      } else if (vchildren === null) {
        vchildren = [simple ? { vtext: child } as VNode : child];

      } else {
        vchildren.push(simple ? { vtext: child } as VNode : child);
      }

      lastSimple = simple;
    }
  }

  if (!Utils.isNil(vnodeData)) {
    // normalize class / classname attributes
    if (vnodeData['className']) {
      vnodeData['class'] = vnodeData['className'];
    }

    if (Utils.isObject(vnodeData['class'])) {
      Object.keys(vnodeData['class']).forEach(key => {
        stack.push(key)
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
    return (nodeName as FunctionalComponent<any>)(vnodeData, vchildren || [], utils);
  }

  return {
    vattrs: vnodeData,
    vtag: nodeName,
    ishost: false,
    vchildren,
    vname,
    vkey,
    // vtext: undefined,
    // elm: undefined,
  } as VNode;
}