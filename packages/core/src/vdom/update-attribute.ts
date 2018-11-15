/**
 * Modified from Stencil
 *
 * Licensed under the MIT License
 * https://github.com/ionic-team/stencil/blob/master/LICENSE
 */

import { Utils } from '@one/core';

import { XLINK_NS } from '../constants';

export function updateAttribute(
  elm: HTMLElement,
  memberName: string,
  newValue: any,
  isBooleanAttr = Utils.isBoolean(newValue),
  isXlinkNs?: boolean,
) {
  isXlinkNs = (memberName !== (memberName = memberName.replace(/^xlink:?/, '')));

  if (Utils.isNil(newValue) || (isBooleanAttr && (!newValue || newValue === 'false'))) {
    if (isXlinkNs) {
      elm.removeAttributeNS(XLINK_NS, memberName.toLowerCase());
    } else {
      elm.removeAttribute(memberName);
    }
  } else if (!Utils.isFunction(newValue)) {
    if (isBooleanAttr) {
      newValue = '';
    } else {
      newValue = newValue.toString();
    }
    if (isXlinkNs) {
      elm.setAttributeNS(XLINK_NS, memberName.toLowerCase(), newValue);
    } else {
      elm.setAttribute(memberName, newValue);
    }
  }
}