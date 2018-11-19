/**
 * Modified from Stencil
 *
 * Licensed under the MIT License
 * https://github.com/ionic-team/stencil/blob/master/LICENSE
 */

import { NODE_TYPE } from '../collection';
import { VNode } from '../interfaces';

export function isSameVNode(vnode1: VNode, vnode2: VNode) {
  // compare if two vnode to see if they're "technically" the same
  // need to have the same element tag, and same key to be the same
  if (vnode1.vtag === vnode2.vtag && vnode1.vkey === vnode2.vkey) {
    return vnode1.vtag === 'slot'
      ? vnode1.vname === vnode2.vname
      : true;
  }
  return false;
}

export function toVNode(node: any): VNode {
  if (
    node.nodeType === NODE_TYPE.ElementNode ||
    node.nodeType === NODE_TYPE.TextNode
  ) {
    const vnode: VNode = {};
    vnode.elm = node;

    if (node.nodeType === NODE_TYPE.ElementNode) {
      // element node
      vnode.vtag = node.nodeName.toLowerCase();

      node.childNodes.forEach(childNode => {
        const childVnode = toVNode(childNode);
        if (childVnode) {
          (vnode.vchildren = vnode.vchildren || []).push(childVnode);
        }
      });

    } else {
      // text node
      vnode.vtext = node.textContent;
    }

    return vnode;
  }

  return null;
}
