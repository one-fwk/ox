import { Utils } from '@one/core';

import { parseClassList } from '../util';
import { updateAttribute } from './update-attribute';

export function setAccessor(
  elm: HTMLElement,
  memberName: string,
  oldValue: any,
  newValue: any,
  isSvg: boolean,
  isHostElement: boolean,
) {
  if (memberName === 'class' && isSvg) {
    if (/*_BUILD_.updatable*/true) {
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
    } else {
      elm.className = newValue;
    }
  } else if (memberName === 'style') {
    // update style attribute, css properties and values
    if (/*_BUILD_.updatable*/true) {
      for (const prop in oldValue) {
        if (!newValue || Utils.isNil(newValue[prop])) {
          if (/-/.test(prop)) {
            elm.style.removeProperty(prop);
          } else {
            (elm as any).style[prop] = '';
          }
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
    } else /*if (_BUILD_.updatable)*/ {
      // remove listener
      elm.removeEventListener(memberName, oldValue);
      // plt.domApi.$removeEventListener(elm, memberName);
    }
  } else if (!Utils.isNil(newValue) && memberName !== 'key') {
    // Element Attributes
    updateAttribute(elm, memberName, newValue);

  } else if (isSvg && elm.hasAttribute(memberName) && (newValue == null || newValue === false)) {
    elm.removeAttribute(memberName);
  }
}