import { RenderNode } from './render.interface';
import { VNodeData } from './vdom.interface';
import { StylesMeta } from './style.interface';

import { ENCAPSULATION, MEMBER_TYPE, PROP_TYPE } from '../collection/constants';
import { Target, TargetPropertyRef, TargetRef } from '@one/core';

/*export interface ComponentConstructor {
  is?: string;
  properties?: ComponentConstructorProperties;
  events?: ComponentConstructorEvent[];
  listeners?: ComponentConstructorListener[];
  host?: ComponentConstructorHost;
  style?: string;
  styleMode?: string;
  encapsulation?: Encapsulation;
}

export interface ComponentConstructorHost {
  theme?: string;
  [attrName: string]: string | undefined;
}*/

export interface ComponentMeta {
  // "Meta" suffix to ensure property renaming
  tagNameMeta: string;
  stylesMeta?: StylesMeta;
  membersMeta?: MemberMeta[];
  methodsMeta?: MethodMeta[];
  listenersMeta?: ListenMeta[];
  watchersMeta?: WatchMeta[];
  encapsulationMeta?: ENCAPSULATION;
  hmrLoad?: () => void;
}

// export type GetModuleFn = (opts?: GetModuleOptions) => Promise<ComponentConstructor>;

/*export interface GetModuleOptions {
  scoped?: boolean;
  mode?: string;
}*/

export interface BundleIds {
  [modeName: string]: string;
}

export interface PropOptions {
  attr?: string;
  mutable?: boolean;
  reflect?: boolean;
}

export interface EventOptions {
  bubbles?: boolean;
  cancelable?: boolean;
  composed?: boolean;
}

export interface MemberMeta extends PropOptions, EventOptions {
  target: Function;
  memberName: string;
  memberType?: MEMBER_TYPE;
}

export interface HostMeta {
  [key: string]: any;
}

export type Encapsulation = 'shadow' | 'scoped' | 'none';

export interface ComponentConstructorProperties {
  [propName: string]: ComponentConstructorProperty;
}

export interface ComponentConstructorProperty {
  attr?: string;
  connect?: string;
  context?: string;
  elementRef?: boolean;
  method?: boolean;
  mutable?: boolean;
  reflectToAttr?: boolean;
  state?: boolean;
  type?: PropertyType;
  watchCallbacks?: string[];
}

export type PropertyType = StringConstructor | BooleanConstructor | NumberConstructor | 'Any';

export interface StateMeta extends TargetPropertyRef {}

export interface ListenMeta extends TargetPropertyRef {
  event: string;
  capture?: boolean;
  disabled?: boolean;
  passive?: boolean;
}

export interface ElementMeta extends TargetPropertyRef {}

export interface MethodMeta extends TargetPropertyRef {}

export interface WatchMeta extends TargetPropertyRef {
  property: string;
}

export abstract class ComponentModule {
  abstract componentWillLoad?: () => Promise<void> | void;
  abstract componentDidLoad?: () => void;
  abstract componentWillUpdate?: () => Promise<void> | void;
  abstract componentDidUpdate?: () => void;
  abstract componentDidUnload?: () => void;

  abstract render?: () => any;
  abstract hostData?: () => VNodeData;

  abstract mode?: string;
  abstract color?: string;

  abstract __el?: HostElement;

  [memberName: string]: any;

  abstract get is(): string;
  abstract get properties(): string;
}

export interface ComponentInternalValues {
  [propName: string]: any;
}

export interface ComponentModule {
  new(): ComponentInstance;
}

export interface ComponentRegistry {
  // registry tag must always be lower-case
  [tagName: string]: ComponentMeta;
}

export interface HostElement extends HTMLElement {
  // web component APIs
  connectedCallback?: () => void;
  attributeChangedCallback?: (attribName: string, oldVal: string, newVal: string, namespace: string) => void;
  disconnectedCallback?: () => void;
  host?: Element;
  forceUpdate?: () => void;

  // "s-" prefixed properties should not be property renamed
  // and should be common between all versions of stencil

  /**
   * Host Element Id:
   * A unique id assigned to this host element.
   */
    ['ox-id']?: string;

  /**
   * Content Reference:
   * Reference to the HTML Comment that's placed inside of the
   * host element's original content. This comment is used to
   * always represent where host element's light dom is.
   */
    ['ox-cr']?: RenderNode;

  /**
   * Is Active Loading:
   * Array of child host elements that are actively loading.
   */
    ['ox-ld']?: HostElement[];

  /**
   * Has Rendered:
   * Set to true if this component has rendered
   */
    ['ox-rn']?: boolean;

  /**
   * On Render Callbacks:
   * Array of callbacks to fire off after it has rendered.
   */
    ['ox-rc']?: (() => void)[];

  /**
   * Scope Id
   * The scope id of this component when using scoped css encapsulation
   * or using shadow dom but the browser doesn't support it
   */
    ['ox-sc']?: string;

  /**
   * Component Initial Load:
   * The component has fully loaded, instance creatd,
   * and has rendered. Method is on the host element prototype.
   */
    ['ox-init']?: () => void;

  /**
   * Hot Module Replacement, dev mode only
   */
    ['ox-hmr']?: (versionId: string) => void;

  /**
   * Callback method for when HMR finishes
   */
    ['ox-hmr-load']?: () => void;

  componentOnReady?: () => Promise<this>;
  color?: string;
  mode?: string;
  [memberName: string]: any;
}

export interface ComponentAppliedStyles {
  [tagNameForStyles: string]: boolean;
}

export type OnReadyCallback = ((elm: HostElement) => void);

export type ComponentHostData = [
  /**
   * tag name (ion-badge)
   */
  string,

  /**
   * map of bundle ids
   */
  BundleIds,

  /**
   * has styles
   */
  boolean,

  /**
   * members
   */
  ComponentMemberData[],

  /**
   * encapsulated
   */
  number,

  /**
   * listeners
   */
  ComponentListenersData[]
  ];

export interface ComponentMemberData {
  /**
   * member name
   */
    [0]: string;

  /**
   * member type
   */
    [1]: number;

  /**
   * reflect to attribute
   */
    [2]: boolean;

  /**
   * is attribute name to observe
   */
    [3]: string | number;

  /**
   * prop type
   */
    [4]: number;

  /**
   * controller id
   */
    [5]: string;
}


export interface ComponentListenersData {
  /**
   * methodName
   */
    [0]: string;

  /**
   * eventName
   */
    [1]: string;

  /**
   * capture
   */
    [2]: number;

  /**
   * passive
   */
    [3]: number;

  /**
   * enabled
   */
    [4]: number;
}

export interface ComponentEventData {
  /**
   * eventName
   */
    [0]: string;

  /**
   * instanceMethodName
   */
    [1]: string;

  /**
   * eventBubbles
   */
    [2]: number;

  /**
   * eventCancelable
   */
    [3]: number;

  /**
   * eventComposed
   */
    [4]: number;
}

/**
 * This file gets copied to all distributions of stencil component collections.
 * - no imports
 */

export interface ComponentWillLoad {
  /**
   * The component is about to load and it has not
   * rendered yet.
   *
   * This is the best place to make any data updates
   * before the first render.
   *
   * componentWillLoad will only be called once.
   */
  componentWillLoad: () => Promise<void> | void;
}

export interface ComponentDidLoad {
  /**
   * The component has loaded and has already rendered.
   *
   * Updating data in this method will cause the
   * component to re-render.
   *
   * componentDidLoad will only be called once.
   */
  componentDidLoad: () => void;
}

export interface ComponentWillUpdate {
  /**
   * The component is about to update and re-render.
   *
   * Called multiple times throughout the life of
   * the component as it updates.
   *
   * componentWillUpdate is not called on the first render.
   */
  componentWillUpdate: () => Promise<void> | void;
}

export interface ComponentDidUpdate {
  /**
   * The component has just re-rendered.
   *
   * Called multiple times throughout the life of
   * the component as it updates.
   *
   * componentWillUpdate is not called on the
   * first render.
   */
  componentDidUpdate: () => void;
}

export interface ComponentDidUnload {
  /**
   * The component did unload and the element
   * will be destroyed.
   */
  componentDidUnload: () => void;
}

export interface ComponentInstance {
  /**
   * The component is about to load and it has not
   * rendered yet.
   *
   * This is the best place to make any data updates
   * before the first render.
   *
   * componentWillLoad will only be called once.
   */
  componentWillLoad?: () => Promise<void> | void;

  /**
   * The component has loaded and has already rendered.
   *
   * Updating data in this method will cause the
   * component to re-render.
   *
   * componentDidLoad will only be called once.
   */
  componentDidLoad?: () => Promise<void> | void;

  /**
   * The component is about to update and re-render.
   *
   * Called multiple times throughout the life of
   * the component as it updates.
   *
   * componentWillUpdate is not called on the first render.
   */
  componentWillUpdate?: () => Promise<void> | void;

  /**
   * The component has just re-rendered.
   *
   * Called multiple times throughout the life of
   * the component as it updates.
   *
   * componentWillUpdate is not called on the
   * first render.
   */
  componentDidUpdate?: () => Promise<void> | void;

  /**
   * The component did unload and the element
   * will be destroyed.
   */
  componentDidUnload?: () => void;

  render?: () => any;

  /**
   * Used to dynamically set host element attributes.
   * Should be placed directly above render()
   */
  hostData?: () => {
    class?: {[className: string]: boolean};
    style?: any;
    [attrName: string]: any;
  };

  [memberName: string]: any;
}


/**
 * General types important to applications using stencil built components
 */
export interface EventEmitter<T= any> {
  emit: (data?: T) => CustomEvent<T>;
}

export interface EventListenerEnable {
  (instance: any, eventName: string, enabled: boolean, attachTo?: string|Element, passive?: boolean): void;
}

export interface QueueApi {
  tick: (cb: RafCallback) => void;
  read: (cb: RafCallback) => void;
  write: (cb: RafCallback) => void;
  clear?: () => void;
  flush?: (cb?: () => void) => void;
}

export interface RafCallback {
  (timeStamp: number): void;
}
