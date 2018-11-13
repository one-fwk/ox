import { cssToDom, defineName, toArray } from './util';
import { IComponent, IComponentData } from './interfaces';
import { MetadataStorage } from './metadata-storage';
import { Type } from '@one/core';

export function createComponentElement({
  componentRef, injector, metadata: { selector, shadow, styles }
}: IComponentData) {
  return new Promise(resolve => {
    if (customElements.get(selector)) {
      throw new Error(`${componentRef.name} has already been declared once as ${selector}`);
    }

    const states = MetadataStorage.getStates(componentRef);
    const props = MetadataStorage.getProps(componentRef);
    const element = MetadataStorage.getElementRef(componentRef);
    const viewChildren = MetadataStorage.getViewChildren(componentRef);

    // Every time a new element is instantiated
    // it should create a new component?
    class ComponentElement extends HTMLElement {
      public _root: ShadowRoot | this;
      public _host: Node | Node[];
      public _component: IComponent;

      static observedAttributes = props.map(({ name }) => name);

      private _createRoot() {
        if (shadow) {
          return this.attachShadow({
            mode: 'open',
          });
        }

        return this.shadowRoot || this;
      }

      connectedCallback() {
        this._root = this._createRoot();
        this._component = injector.resolve(componentRef);

        this._host = this._component.render();

        toArray(<Node>this._host).forEach(item => {
          this._root.appendChild(item);
        });

        if (Array.isArray(styles)) {
          styles.forEach(style => {
            this._root.appendChild(cssToDom(style));
          });
        }

        if (element && element.propertyKey) {
          this._component[element.propertyKey] = this._root;
        }

        viewChildren.forEach(({ child, propertyKey }) => {
          // @TODO: if it is a shadow root, get the component using injector instead
          const { selector } = MetadataStorage.getComponent(child);
          const childEl = this._root.querySelector(selector);

          if (!childEl) {
            throw new Error('You fetch a view children which has a shadow root');
          }

          this._component[propertyKey] = childEl._root;
        });

        props.forEach(({ name, propertyKey }) => {
          if (this.hasAttribute(name)) {
            this._component[propertyKey] = this.getAttribute(name);
          }
        });
      }

      /*async disconnectedCallback() {
        if (Utils.isFunction(this._component.componentWillUnmount)) {
          await this._component.componentWillUnmount();
        }
      }*/


      attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        if (!this.isConnected) return;

        const { propertyKey } = MetadataStorage.getPropByName(componentRef, name);

        if (newValue !== this._component[propertyKey]) {
          this._component[propertyKey] = newValue;
        }
      }

    }

    defineName(ComponentElement, componentRef.name);

    customElements.whenDefined(selector)
      .then(() => resolve(ComponentElement));

    customElements.define(selector, ComponentElement);
  });
}