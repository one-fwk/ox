import { Injectable } from '@one/core';

import { ComponentMeta, HostElement } from '../interfaces';
import { DEFAULT_STYLE_MODE, ENCAPSULATION } from '../collection';
import { PlatformService } from '../platform';
import { getScopeId } from '../util';

@Injectable()
export class StyleService {
  constructor(private readonly plt: PlatformService) {}

  public attachStyles(cmpMeta: ComponentMeta, hostElm: HostElement) {
    // first see if we've got a style for a specific mode
    // either this host element should use scoped css
    // or it wants to use shadow dom but the browser doesn't support it
    // create a scope id which is useful for scoped css
    // and add the scope attribute to the host

    // create the style id w/ the host element's mode
    let styleId = cmpMeta.tagNameMeta + (hostElm.mode || DEFAULT_STYLE_MODE);
    let styleTemplate = cmpMeta[styleId];

    const shouldScopeCss = (
      cmpMeta.encapsulationMeta === ENCAPSULATION.ScopedCss ||
      (cmpMeta.encapsulationMeta === ENCAPSULATION.ShadowDom &&
        !this.plt.supportsShadowDom)
    );
    if (shouldScopeCss) {
      hostElm['ox-sc'] = styleTemplate
        ? getScopeId(cmpMeta, hostElm.mode)
        : getScopeId(cmpMeta);
    }

    if (!styleTemplate) {
      // doesn't look like there's a style template with the mode
      // create the style id using the default style mode and try again
      styleId = cmpMeta.tagNameMeta + DEFAULT_STYLE_MODE;
      styleTemplate = cmpMeta[styleId];
    }

    if (styleTemplate) {
      // cool, we found a style template element for this component
      let styleContainerNode: HTMLElement = document.head;

      if (this.plt.supportsShadowDom) {
        if (cmpMeta.encapsulationMeta === ENCAPSULATION.ShadowDom) {
          // we already know we're in a shadow dom
          // so shadow root is the container for these styles
          styleContainerNode = <any>hostElm.shadowRoot;
        } else {
          // climb up the dom and see if we're in a shadow dom
          const rootEl = (<any>hostElm).getRootNode();
          if (rootEl.host) {
            styleContainerNode = rootEl;
          }
        }
      }

      // if this container element already has these styles
      // then there's no need to apply them again
      // create an object to keep track if we'ready applied this component style
      /*let appliedStyles = plt.componentAppliedStyles.get(styleContainerNode);
      if (!appliedStyles) {
        plt.componentAppliedStyles.set(styleContainerNode, appliedStyles = {});
      }*/
    }
  }
}