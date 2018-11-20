import { Injectable, Utils } from '@one/core';

import { PlatformService, RegistryService } from '@ox/platform';
import { updateAttribute } from './update-attribute';
import { isSameVNode } from './to-vnode';
// import { StyleService } from '../../core/src/styles/index';
import { h } from './h';
import {
  getElementScopeId,
  isDef,
  parseClassList,
  setProperty,
  EMPTY_OBJ,
  ENCAPSULATION,
  MEMBER_TYPE,
  Metadata,
  NODE_TYPE,
  PROP_TYPE,
  RUNTIME_ERROR,
  SVG_NS,
  ComponentInstance,
  ComponentMeta,
  HostElement,
  MemberMeta,
  RenderNode,
  VNode,
  VNodeData,
} from '@ox/collection';

export interface RelocateNode {
  slotRefNode: RenderNode;
  nodeToRelocate: RenderNode;
}

@Injectable()
export class VDomService {
  private checkSlotFallbackVisibility: boolean;
  private relocateNodes = new Set<RelocateNode>();
  private useNativeShadowDom: boolean;
  private checkSlotRelocate: boolean;
  private contentRef: RenderNode;
  private hostElm: HostElement;
  private hostTagName: string;
  private isSvgMode = false;
  private scopeId: string;

  constructor(
    private readonly platform: PlatformService,
    private readonly registry: RegistryService,
    // private readonly style: StyleService,
  ) {}

  private createRelocateNode(
    slotRefNode: RenderNode,
    nodeToRelocate: RenderNode,
  ): RelocateNode {
    return { slotRefNode, nodeToRelocate };
  }

  private relocateSlotContent(
    elm: RenderNode,
    childNodes?: RenderNode[],
    childNode?: RenderNode,
    node?: RenderNode,
    i?: number,
    ilen?: number,
    j?: number,
    hostContentNodes?: NodeList,
    slotNameAttr?: string,
    nodeType?: NODE_TYPE
  ) {
    childNodes = elm.childNodes as any;

    for (i = 0, ilen = childNodes.length; i < ilen; i++) {
      childNode = childNodes[i];

      if (childNode['ox-sr'] && (node = childNode['ox-cr'])) {
        // first got the content reference comment node
        // then we got it's parent, which is where all the host content is in now
        hostContentNodes = node.parentNode.childNodes;
        slotNameAttr = childNode['ox-sn'];

        for (j = hostContentNodes.length - 1; j >= 0; j--) {
          node = hostContentNodes[j] as RenderNode;

          if (!node['ox-cn'] && !node['ox-nr'] && node['ox-hn'] !== childNode['ox-hn']) {
            // let's do some relocating to its new home
            // but never relocate a content reference node
            // that is suppose to always represent the original content location
            nodeType = node.nodeType;

            if (
              ((nodeType === NODE_TYPE.TextNode || nodeType === NODE_TYPE.CommentNode) && slotNameAttr === '') ||
              (nodeType === NODE_TYPE.ElementNode && !node.getAttribute('slot') && slotNameAttr === '') ||
              (nodeType === NODE_TYPE.ElementNode && node.getAttribute('slot') === slotNameAttr)
            ) {
              // it's possible we've already decided to relocate this node
              const relocatedNode = this.createRelocateNode(childNode, node);
              if (!this.relocateNodes.has(relocatedNode)) {
                // made some changes to slots
                // let's make sure we also double check
                // fallbacks are correctly hidden or shown
                this.checkSlotFallbackVisibility = true;
                node['ox-sn'] = slotNameAttr;

                // add to our list of nodes to relocate
                this.relocateNodes.add(relocatedNode);
              }
            }
          }
        }
      }

      if (childNode.nodeType === NODE_TYPE.ElementNode) {
        this.relocateSlotContent(childNode);
      }
    }
  }

  private updateChildren(
    parentElm: RenderNode,
    oldCh: VNode[],
    newVNode: VNode,
    newCh: VNode[],
    idxInOld?: number,
    i?: number,
    node?: Node,
    elmToMove?: VNode,
  ) {
    let oldStartIdx = 0, newStartIdx = 0;
    let oldEndIdx = oldCh.length - 1;
    let oldStartVNode = oldCh[0];
    let oldEndVNode = oldCh[oldEndIdx];
    let newEndIdx = newCh.length - 1;
    let newStartVNode = newCh[0];
    let newEndVNode = newCh[newEndIdx];

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (oldStartVNode == null) {
        // Vnode might have been moved left
        oldStartVNode = oldCh[++oldStartIdx];

      } else if (oldEndVNode == null) {
        oldEndVNode = oldCh[--oldEndIdx];

      } else if (newStartVNode == null) {
        newStartVNode = newCh[++newStartIdx];

      } else if (newEndVNode == null) {
        newEndVNode = newCh[--newEndIdx];

      } else if (isSameVNode(oldStartVNode, newStartVNode)) {
        this.patchVNode(oldStartVNode, newStartVNode);
        oldStartVNode = oldCh[++oldStartIdx];
        newStartVNode = newCh[++newStartIdx];

      } else if (isSameVNode(oldEndVNode, newEndVNode)) {
        this.patchVNode(oldEndVNode, newEndVNode);
        oldEndVNode = oldCh[--oldEndIdx];
        newEndVNode = newCh[--newEndIdx];

      } else if (isSameVNode(oldStartVNode, oldEndVNode)) {
        // VNode moved right
        if (oldStartVNode.vtag === 'slot' || newEndVNode.vtag === 'slot') {
          this.putBackInOriginalLocation(oldStartVNode.elm.parentNode);
        }
        this.patchVNode(oldStartVNode, newEndVNode);
        parentElm.insertBefore(oldStartVNode.elm, oldEndVNode.elm.nextSibling);
        oldStartVNode = oldCh[++oldStartIdx];
        newEndVNode = newCh[--newEndIdx];

      } else if (isSameVNode(oldEndVNode, newStartVNode)) {
        // VNode moved left
        if (oldStartVNode.vtag === 'slot' || newEndVNode.vtag === 'slot') {
          this.putBackInOriginalLocation(oldEndVNode.elm.parentNode);
        }
        this.patchVNode(newEndVNode, oldStartVNode);
        parentElm.insertBefore(oldEndVNode.elm, oldStartVNode.elm);
        oldEndVNode = oldCh[--oldEndIdx];
        newStartVNode = newCh[++newStartIdx];

      } else {
        // createKeyToOldIdx
        idxInOld = null;
        for (i = oldStartIdx; i <= oldEndIdx; ++i) {
          if (oldCh[i] && isDef(oldCh[i].vkey) && oldCh[i].vkey === newStartVNode.vkey) {
            idxInOld = i;
            break;
          }
        }

        if (isDef(idxInOld)) {
          elmToMove = oldCh[idxInOld];

          if (elmToMove.vtag !== newStartVNode.vtag) {
            node = this.createElm(oldCh && oldCh[newStartIdx], newVNode, idxInOld, parentElm);

          } else {
            this.patchVNode(elmToMove, newStartVNode);
            oldCh[idxInOld] = undefined;
            node = elmToMove.elm;
          }

          newStartVNode = newCh[++newStartIdx];
        } else {
          // new element
          node = this.createElm(oldCh && oldCh[newStartIdx], newVNode, newStartIdx, parentElm);
          newStartVNode = newCh[++newStartIdx];
        }

        if (node) {
          this.parentReferenceNode(oldStartVNode.elm).insertBefore(
            node,
            this.referenceNode(oldStartVNode.elm),
          );
        }
      }
    }

    if (oldStartIdx > oldEndIdx) {
      this.addVNodes(
        parentElm,
        (newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm),
        newVNode,
        newCh,
        newStartIdx,
        newEndIdx,
      );
    } else if (newStartIdx > newEndIdx) {
      this.removeVNodes(oldCh, oldStartIdx, oldEndIdx);
    }
  }

  private setAccessor(
    elm: HTMLElement,
    memberName: string,
    oldValue: any,
    newValue: any,
    isHostElement: boolean,
  ) {
    if (memberName === 'class' && this.isSvgMode) {
      if (oldValue !== newValue) {
        const oldList = parseClassList(oldValue);
        const newList = parseClassList(newValue);

        // remove classes in oldList, not included in newList
        const toRemove = oldList.filter(item => !newList.includes(item));
        const classList = parseClassList(elm.className)
          .filter(item => !toRemove.includes(item));

        // add classes from newValue that are not in oldList or classList
        const toAdd = newList.filter(item =>
          !oldList.includes(item) && !classList.includes(item)
        );

        classList.push(...toAdd);
        elm.className = classList.join(' ');
      }
    } else if (memberName === 'style') {
      // update style attribute, css properties and values
      for (const prop in oldValue) {
        if (!newValue || Utils.isNil(newValue[prop])) {
          if (/-/.test(prop)) {
            elm.style.removeProperty(prop);
          } else {
            (elm as any).style[prop] = '';
          }
        }
      }

      for (const prop in newValue) {
        if (!oldValue || newValue[prop] !== oldValue[prop]) {
          if (/-/.test(prop)) {
            elm.style.setProperty(prop, newValue[prop]);
          } else {
            (elm as any).style[prop] = newValue[prop];
          }
        }
      }
    } else if ((memberName[0] === 'o' && memberName[1] === 'n' && /[A-Z]/.test(memberName[2])) && (!(memberName in elm))) {
      // Event Handlers
      // so if the member name starts with "on" and the 3rd characters is
      // a capital letter, and it's not already a member on the element,
      // then we're assuming it's an event listener

      if (memberName.toLowerCase() in elm) {
        // standard event
        // the JSX attribute could have been "onMouseOver" and the
        // member name "onmouseover" is on the element's prototype
        // so let's add the listener "mouseover", which is all lowercased
        memberName = memberName.substring(2).toLowerCase();
      } else {
        // custom event
        // the JSX attribute could have been "onMyCustomEvent"
        // so let's trim off the "on" prefix and lowercase the first character
        // and add the listener "myCustomEvent"
        // except for the first character, we keep the event name case
        memberName = memberName[2].toLowerCase() + memberName.substring(3);
      }

      if (newValue) {
        if (newValue !== oldValue) {
          // add listener
          elm.addEventListener(memberName, newValue);
        }
      } else {
        // remove listener
        elm.removeEventListener(memberName, oldValue);
      }
    } else if (memberName !== 'list' && memberName !== 'type' && !this.isSvgMode &&
      (memberName in elm || (['object', 'function'].includes(typeof newValue)) && newValue !== null)) {
      // Properties
      // - list and type are attributes that get applied as values on the element
      // - all svgs get values as attributes not props
      // - check if elm contains name or if the value is array, object, or function
      const cmpMeta = this.registry.getCmpMeta(elm);

      const memberMeta = Metadata.getMemberProps(cmpMeta)
        .find(member => member.memberName === memberName);

      if (cmpMeta && cmpMeta.membersMeta && cmpMeta.membersMeta[memberName]) {
        // we know for a fact that this element is a known component
        // and this component has this member name as a property,
        // let's set the known @Prop on this element
        // set it directly as property on the element
        setProperty(elm, memberName, newValue);

        const memberMeta = cmpMeta.membersMeta[memberName];
        if (isHostElement && memberMeta.reflect) {
          updateAttribute(
            elm,
            memberMeta.attrName,
            newValue,
            memberMeta.propType === PROP_TYPE.Boolean,
          )
        }
      } else if (memberName !== 'ref') {
        // this member name is a property on this element, but it's not a component
        // this is a native property like "value" or something
        // also we can ignore the "ref" member name at this point
        setProperty(elm, memberName, newValue == null ? '' : newValue);
        if (newValue == null || newValue === false) {
          elm.removeAttribute(memberName);
        }
      }

    } else if (!Utils.isNil(newValue) && memberName !== 'key') {
      // Element Attributes
      updateAttribute(elm, memberName, newValue);

    } else if (this.isSvgMode && elm.hasAttribute(memberName) && (newValue == null || newValue === false)) {
      // remove svg attribute
      elm.removeAttribute(memberName);
    }
  }

  private updateElement(oldVnode: VNode | null, newVnode: VNode, memberName?: string) {
    // if the element passed in is a shadow root, which is a document fragment
    // then we want to be adding attrs/props to the shadow root's "host" element
    // if it's not a shadow root, then we add attrs/props to the same element
    const elm = (newVnode.elm.nodeType === NODE_TYPE.DocumentFragment && newVnode.elm.host)
      ? newVnode.elm.host
      : (newVnode.elm as any);

    const oldVnodeAttrs = (oldVnode && oldVnode.vattrs) || EMPTY_OBJ;
    const newVnodeAttrs = newVnode.vattrs || EMPTY_OBJ;

    // remove attributes no longer present on the vnode by setting them to undefined
    for (memberName in oldVnodeAttrs) {
      if (!(newVnodeAttrs && newVnodeAttrs[memberName] != null) && oldVnodeAttrs[memberName] != null) {
        this.setAccessor(elm, memberName, oldVnodeAttrs[memberName], undefined, newVnode.ishost);
      }
    }

    // add new & update changed attributes
    for (memberName in newVnodeAttrs) {
      if (!(memberName in oldVnodeAttrs) || newVnodeAttrs[memberName] !== (memberName === 'value' || memberName === 'checked' ? elm[memberName] : oldVnodeAttrs[memberName])) {
        this.setAccessor(elm, memberName, oldVnodeAttrs[memberName], newVnodeAttrs[memberName], newVnode.ishost);
      }
    }
  }

  private parentReferenceNode(node: RenderNode) {
    return (node['ox-ol'] ? node['ox-ol'] : node).parentNode;
  }

  private referenceNode(node: RenderNode) {
    if (node && node['ox-ol']) {
      // this node was relocated to a new location in the dom
      // because of some other component's slot
      // but we still have an html comment in place of where
      // it's original location was according to it's original vdom
      return node['ox-ol'];
    }
    return node;
  }

  private putBackInOriginalLocation(
    parentElm: Node,
    recursive?: boolean,
    i?: number,
    childNode?: RenderNode,
  ) {
    this.platform.tmpDisconnected = true;

    const oldSlotChildNodes = parentElm.childNodes;
    for (i = oldSlotChildNodes.length - 1; i >= 0; i--) {
      childNode = oldSlotChildNodes[i] as any;

      if (childNode['ox-hn'] !== this.hostTagName && childNode['ox-ol']) {
        // this child node in the old element is from another component
        // remove this node from the old slot's parent
        childNode.remove();

        // and relocate it back to it's original location
        this.parentReferenceNode(childNode).insertBefore(
          childNode,
          this.referenceNode(childNode),
        );

        // remove the old original location comment entirely
        // later on the patch function will know what to do
        // and move this to the correct spot in need be
        childNode['ox-ol'].remove();
        childNode['ox-ol'] = undefined;

        this.checkSlotRelocate = true;
      }
    }

    if (recursive) {
      this.putBackInOriginalLocation(childNode, recursive);
    }

    this.platform.tmpDisconnected = false;
  }

  private createElm(
    oldParentVNode: VNode,
    newParentVNode: VNode,
    childIndex: number,
    parentElm: RenderNode,
    i?: number,
    elm?: RenderNode,
    childNode?: RenderNode,
    newVNode?: VNode,
    oldVNode?: VNode,
  ): RenderNode {
    newVNode = newParentVNode.vchildren[childIndex];

    if (!this.useNativeShadowDom) {
      // remember for later we need to check to relocate nodes
      this.checkSlotRelocate = true;

      if (newVNode.vtag === 'slot') {
        if (this.scopeId) {
          // scoped css needs to add its scoped id to the parent element
          parentElm.classList.add(`${this.scopeId}-s`);
        }

        if (!newVNode.vchildren) {
          // slot element does not have fallback content
          // create an html comment we'll use to always reference
          // where actual slot content should sit next to
          newVNode.isSlotReference = true;
        } else {
          // slot element has fallback content
          // still create an element that "mocks" the slot element
          newVNode.isSlotFallback = true;
        }
      }
    }

    if (isDef(newVNode.vtext)) {
      // create text node
      newVNode.elm = document.createTextNode(newVNode.vtext) as any;
    } else if (newVNode.isSlotReference) {
      // create a slot reference html text node
      newVNode.elm = document.createTextNode('') as any;
    } else {
      elm = newVNode.elm = (this.isSvgMode || newVNode.vtag === 'svg'
        ? document.createElementNS(SVG_NS, <string>newVNode.vtag)
        : document.createElement(newVNode.isSlotFallback ? 'slot-fb' : <string>newVNode.vtag)) as any;

      if (this.registry.hasCmpMeta(elm)) {
        this.registry.isCmpReady.delete(this.hostElm);
      }

      this.isSvgMode = newVNode.vtag !== 'svg'
        ? (newVNode.vtag === 'foreignObject' ? false : this.isSvgMode)
        : true;

      // add css classes, attrs, props, listeners, etc.
      this.updateElement(null, newVNode);

      if (isDef(this.scopeId) && elm['ox-si'] !== this.scopeId) {
        // if there is a scopeId and this is the initial render
        // then let's add the scopeId as an attribute
        elm.classList.add((elm['ox-si'] = this.scopeId));
      }

      if (newVNode.vchildren) {
        for (i = 0; i < newVNode.vchildren.length; ++i) {
          // create the node
          childNode = this.createElm(oldParentVNode, newVNode, i, elm);

          // return node could have been null
          if (childNode) {
            // append our new node
            elm.appendChild(childNode);
          }
        }
      }

      if (newVNode.vtag === 'svg') {
        // Only reset the SVG context when we're exiting SVG element
        this.isSvgMode = true;
      }
    }

    newVNode.elm['ox-hn'] = this.hostTagName;

    if (newVNode.isSlotFallback || newVNode.isSlotReference) {
      // remember the content reference comment
      newVNode.elm['ox-sr'] = true;
      // remember the content reference comment
      newVNode.elm['ox-cr'] = this.contentRef;
      // remember the slot name, or empty string for default slot
      newVNode.elm['ox-sn'] = newVNode.vname || '';

      // check if we've got an old vnode for this slot
      oldVNode = oldParentVNode && oldParentVNode.vchildren && oldParentVNode.vchildren[childIndex];
      if (oldVNode && oldVNode.vtag === newVNode.vtag && oldParentVNode.elm) {
        // we've got an old slot vnode and the wrapper is being replaced
        // so let's move the old slot content back to it's original location
        this.putBackInOriginalLocation(oldParentVNode.elm);
      }
    }

    return newVNode.elm;
  }

  private addVNodes(
    parentElm: RenderNode,
    before: RenderNode,
    parentVNode: VNode,
    vnodes: VNode[],
    startIdx: number,
    endIdx: number,
    containerElm?: RenderNode,
    childNode?: Node,
  ) {
    const contentRef = parentElm['ox-cr'];
    containerElm = <any>((contentRef && contentRef.parentNode) || parentElm);
    if (containerElm.shadowRoot && containerElm.tagName === this.hostTagName) {
      containerElm = <any>containerElm.shadowRoot;
    }

    for (; startIdx <= endIdx; ++startIdx) {
      if (vnodes[startIdx]) {
        childNode = isDef(vnodes[startIdx].vtext)
          ? document.createTextNode(vnodes[startIdx].vtext)
          : this.createElm(null, parentVNode, startIdx, parentElm);

        if (childNode) {
          vnodes[startIdx].elm = <any>childNode;
          containerElm.insertBefore(childNode, this.referenceNode(before));
        }
      }
    }
  }

  private removeVNodes(vnodes: VNode[], startIdx: number, endIdx: number, node?: RenderNode) {
    for (; startIdx <= endIdx; ++startIdx) {
      if (isDef(vnodes[startIdx])) {
        node = vnodes[startIdx].elm;

        // we're removing this element
        // so it's possible we need to show slot fallback content now
        this.checkSlotFallbackVisibility = true;
        if (node['ox-ol']) {
          // remove the original location comment
          node['ox-ol'].remove();
        } else {
          // it's possible that child nodes of the node
          // that's being removed are slot nodes
          this.putBackInOriginalLocation(node, true);
        }

        // remove the vnode's element from the dom
        node.remove();
      }
    }
  }

  private updateFallbackSlotVisibility(
    elm: RenderNode,
    childNode?: RenderNode,
    childNodes?: RenderNode[],
    i?: number,
    ilen?: number,
    j?: number,
    slotNameAttr?: string,
    nodeType?: NODE_TYPE,
  ) {
    childNodes = <any>elm.childNodes;

    for (i = 0, ilen = childNodes.length; i < ilen; i++) {
      childNode = childNodes[i];

      if (childNode.nodeType === NODE_TYPE.ElementNode) {
        if (childNode['ox-sr']) {
          // this is a slot fallback node

          // get the slot name for this slot reference node
          slotNameAttr = childNode['ox-sn'];

          // by default always show a fallback slot node
          // then hide it if there are other slots in the light dom
          childNode.hidden = false;

          for (j = 0; j < ilen; j++) {
            if (childNodes[j]['ox-hn'] !== childNode['ox-hn']) {
              // this sibling node is from a different component
              nodeType = childNodes[j].nodeType;

              if (slotNameAttr !== '') {
                // this is a named fallback slot node
                if (nodeType === NODE_TYPE.ElementNode && slotNameAttr === childNodes[j].getAttribute('slot')) {
                  childNode.hidden = true;
                  break;
                }

              } else {
                // this is a default fallback slot node
                // any element or text node (with content)
                // should hide the default fallback slot node
                if (nodeType === NODE_TYPE.ElementNode || (nodeType === NODE_TYPE.TextNode && childNodes[j].textContent.trim() !== '')) {
                  childNode.hidden = true;
                  break;
                }
              }
            }
          }
        }

        // keep drilling down
        this.updateFallbackSlotVisibility(childNode);
      }
    }
  }

  // reference
  private patchVNode(oldVNode: VNode, newVNode: VNode, defaultHolder?: Comment) {
    const elm = newVNode.elm = oldVNode.elm;
    const oldChildren = oldVNode.vchildren;
    const newChildren = newVNode.vchildren;

    this.isSvgMode = newVNode.elm &&
      isDef(newVNode.elm.parentElement) &&
      !Utils.isUndefined(((newVNode.elm as any) as SVGElement).ownerSVGElement);

    this.isSvgMode = newVNode.vtag === 'svg' ? true : (newVNode.vtag === 'foreignObject' ? false : this.isSvgMode);

    if (!isDef(newVNode.vtext)) {
      // element node
      if (newVNode.vtag !== 'slot') {
        // either this is the first render of an element OR it's an update
        // AND we already know it's possible it could have changed
        // this updates the element's css classes, attrs, props, listeners, etc.
        this.updateElement(oldVNode, newVNode);
      }

      if (isDef(oldChildren) && isDef(newChildren)) {
        // looks like there's child vnodes for both the old and new vnodes
        this.updateChildren(elm, oldChildren, newVNode, newChildren);

      } else if (isDef(newChildren)) {
        if (isDef(oldVNode.vtext)) {
          // the old vnode was text, so be sure to clear it out
          elm.textContent = '';
        }

        this.addVNodes(elm, null, newVNode, newChildren, 0, newChildren.length - 1);

      } else if (isDef(oldChildren)) {
        this.removeVNodes(oldChildren, 0, oldChildren.length - 1);

      }
    } else if (defaultHolder = (elm['ox-cr'] as any)) {
      // this element has slotted content
      defaultHolder.parentNode.textContent = newVNode.vtext;
    }

    // reset svgMode when svg node is fully patched
    if (this.isSvgMode && 'svg' === newVNode.vtag) {
      this.isSvgMode = false;
    }
  }

  public callNodeRefs(vnode: VNode, isDestroy?: boolean) {
    if (vnode) {
      vnode.vattrs && vnode.vattrs.ref && vnode.vattrs.ref(isDestroy ? null : vnode.elm);

      (vnode.vchildren || []).forEach(vchild => {
        this.callNodeRefs(vchild, isDestroy);
      });
    }
  }

  /*private reflectInstanceValuesToHostAttributes(
    properties: MemberMeta[],
    instance: ComponentInstance,
  ) {
    return properties.reduce((reflectHostAttr, memberName) => ({
      ...reflectHostAttr,
      [memberName]: instance[memberName],
    }), {} as VNodeData);
  }*/

  public patch(
    hostElm: HostElement,
    oldVNode: VNode,
    newVNode: VNode,
    useNativeShadowDomVal?: boolean,
    encapsulation?: ENCAPSULATION,
    ssrPatchId?: number,
    i?: number,
    orgLocationNode?: RenderNode,
    refNode?: RenderNode,
    parentNodeRef?: Node,
    insertBeforeNode?: Node
  ) {
    // patchVNode() is synchronous
    // so it is safe to set these variables and internally
    // the same patch() call will reference the same data
    this.hostElm = hostElm;
    this.hostTagName = hostElm.tagName;
    this.contentRef = hostElm['ox-cr'];
    this.useNativeShadowDom = useNativeShadowDomVal;

    // get the scopeId
    this.scopeId = hostElm['ox-sc'];

    // always reset
    this.checkSlotRelocate = this.checkSlotFallbackVisibility = false;

    // synchronous patch
    this.patchVNode(oldVNode, newVNode);

    if (this.checkSlotRelocate) {
      this.relocateSlotContent(newVNode.elm);

      this.relocateNodes.forEach(({ nodeToRelocate }) => {
        if (!nodeToRelocate['ox-ol']) {
          // add a reference node marking this node's original location
          // keep a reference to this node for later lookups
          orgLocationNode = document.createTextNode('') as any;
          orgLocationNode['ox-nr'] = nodeToRelocate;

          nodeToRelocate.parentNode.insertBefore(
            (nodeToRelocate['ox-ol'] = orgLocationNode),
            nodeToRelocate,
          );
        }
      });

      // while we're moving nodes around existing nodes, temporarily disable
      // the disconnectCallback from working
      this.platform.tmpDisconnected = true;

      this.relocateNodes.forEach(({ nodeToRelocate, slotRefNode }) => {
        // by default we're just going to insert it directly
        // after the slot reference node
        parentNodeRef = slotRefNode.parentNode;
        insertBeforeNode = slotRefNode.nextSibling;

        orgLocationNode = nodeToRelocate['ox-ol'];

        while (orgLocationNode = orgLocationNode.previousSibling as any) {
          if ((refNode = orgLocationNode['ox-nr']) && refNode) {
            if (refNode['ox-sn'] === nodeToRelocate['ox-sn']) {
              if (parentNodeRef === refNode.parentNode) {
                if ((refNode = refNode.nextSibling as any) && refNode && !refNode['ox-nr']) {
                  insertBeforeNode = refNode;
                  break;
                }
              }
            }
          }
        }

        if (
          (!insertBeforeNode && parentNodeRef !== nodeToRelocate) ||
          (nodeToRelocate.nextSibling !== insertBeforeNode)
        ) {
          // we've checked that it's worth while to relocate
          // since that the node to relocate
          // has a different next sibling or parent relocated
          if (nodeToRelocate !== insertBeforeNode) {
            // remove the node from the dom
            nodeToRelocate.remove();

            // add it back to the dom but in its new home
            parentNodeRef.insertBefore(nodeToRelocate, insertBeforeNode);
          }
        }
      });

      // done moving nodes around
      // allow the disconnect callback to work again
      this.platform.tmpDisconnected = false;
    }

    if (this.checkSlotFallbackVisibility) {
      this.updateFallbackSlotVisibility(newVNode.elm);
    }

    // always reset
    this.relocateNodes.clear();

    // return our new vnode
    return newVNode;
  }

  public render(
    cmpMeta: ComponentMeta,
    hostElm: HostElement,
    instance: ComponentInstance,
  ) {
    try {
      const { membersMeta, encapsulationMeta } = cmpMeta;

      const useNativeShadowDom = encapsulationMeta === ENCAPSULATION.ShadowDom && this.platform.supportsShadowDom;
      const rootElm = <HTMLElement>(useNativeShadowDom ? hostElm.shadowRoot : hostElm);

      // const reflectHostAttr = this.reflectInstanceValuesToHostAttributes(membersMeta, instance);

      if (!hostElm['ox-rn']) {
        // attach the styles this component needs, if any
        // this fn figures out if the styles should go in a
        // shadow root or if they should be global
        // this.style.attachStyles(cmpMeta, hostElm);

        const scopeId = hostElm['ox-sc'];
        if (scopeId) {
          hostElm.classList.add(getElementScopeId(scopeId, true));
          if (encapsulationMeta === ENCAPSULATION.ScopedCss) {
            hostElm.classList.add(getElementScopeId(scopeId));
          }
        }
      }

      if (instance.render || instance.hostData/* || reflectHostAttr*/) {
        // tell the platform we're actively rendering
        // if a value is changed within a render() then
        // this tells the platform not to queue the change
        this.platform.activeRender = true;

        const vnodeChildren = instance.render && instance.render();

        let vnodeHostData = instance.hostData && instance.hostData();

        /*if (reflectHostAttr) {
          vnodeHostData = vnodeHostData ? Object.assign(vnodeHostData, reflectHostAttr) : reflectHostAttr;
        }*/

        // tell the platform we're done rendering
        // now any changes will again queue
        this.platform.activeRender = false;

        // looks like we've got child nodes to render into this host element
        // or we need to update the css class/attrs on the host element
        const hostVNode = h(null, vnodeHostData, vnodeChildren);

        // if we haven't already created a vnode, then we give the renderer the actual element
        // if this is a re-render, then give the renderer the last vnode we already created
        const oldVNode = this.registry.vnodes.get(hostElm) || ({} as VNode);
        oldVNode.elm = rootElm;

        /*if (reflectToAttr) {
          // only care if we're reflecting values to the host element
          hostVNode.ishost = true;
        }*/

        // each patch always gets a new vnode
        // the host element itself isn't patched because it already exists
        // kick off the actual render and any DOM updates
        this.registry.vnodes.set(hostElm, this.patch(
          hostElm,
          oldVNode,
          hostVNode,
          useNativeShadowDom,
          encapsulationMeta,
        ));

        // it's official, this element has rendered
        hostElm['ox-rn'] = true;

        if (hostElm['ox-rc']) {
          // ok, so turns out there are some child host elements
          // waiting on this parent element to load
          // let's fire off all update callbacks waiting
          hostElm['ox-rc'].forEach(cb => cb());
          hostElm['ox-rc'] = null;
        }
      }
    } catch (e) {
      this.platform.activeRender = false;
      console.error(e, RUNTIME_ERROR.RenderError, hostElm, true);
    }
  }
}