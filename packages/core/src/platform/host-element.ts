import { Abstract, ComponentInstance, ComponentMeta, HostElement, MemberMeta } from '../interfaces';
import { noop } from '../util';
import { definePropertyGetterSetter, definePropertyValue } from './proxy-members';
import { MEMBER_TYPE } from '../constants';
import { PlatformService } from './platform.service';

export type AttrPropsMap = {[attr: string]: string};

export class HostElementInstance {
  constructor(
    private readonly platform: PlatformService,
    private readonly cmpMeta: ComponentMeta,
    private readonly hostElm: HostElement,
  ) {}

  private attributeChanged(attrPropsMap: AttrPropsMap, attrName: string, newVal: string) {
    // look up to see if we have a property wired up to this attribute name
    const propName = attrPropsMap[attrName.toLowerCase()];
    if (propName) {
      // there is not need to cast the value since, it's already casted when
      // the prop is setted
      this.hostElm[propName] = newVal;
    }
  }

  private proxy(membersEntries: [string, MemberMeta][]) {
    // create getters/setters on the host element prototype to represent the public API
    // the setters allows us to know when data has changed so we can re-render
    membersEntries.forEach(([memberName, { memberType, propType }]) => {
      if ((memberType & (MEMBER_TYPE.Prop | MEMBER_TYPE.PropMutable))) {
        // @Prop() or @Prop({ mutable: true })
        definePropertyGetterSetter(
          this.hostElm,
          memberName,
          ()  => {
            // get value from component
          },
          (newValue: any) =>  {
            // set value in component
          },
        );
      } else if (memberType === MEMBER_TYPE.Method) {
        // @Method()
        // add a placeholder noop value on the host element's prototype
        // incase this method gets called before setup
        definePropertyValue(this.hostElm, memberName, noop);
      }
    });
  }

  public create() {
    // let's wire up our functions to the host element's prototype
    // we can also inject our platform into each one that needs that api
    // note: these cannot be arrow functions cuz "this" is important here hombre

    this.hostElm.connectedCallback = () => {
      // needs to be done in queue client
      // const component = this.platform.resolveComponent(this.hostElm);
      // coolsville, our host element has just hit the DOM
    };

    this.hostElm.disconnectedCallback = () => {
      // the element has left the builing
    };

    this.hostElm['s-init'] = () => {
      // initComponentLoaded(plt, this, hydratedCssClass, perf);
    };

    this.hostElm.forceUpdate = () => {
      // queueUpdate(plt, this, perf);
    };

    if (this.cmpMeta.membersMeta) {
      const entries = Object.entries(this.cmpMeta.membersMeta);
      const attrToProp = entries
        .filter(([, { attribName }]) => attribName)
        .reduce((attrs, [propName, {attribName}]) => ({
          ...attrs,
          [attribName]: propName,
        }), {} as AttrPropsMap);

      this.hostElm.attributeChangedCallback = (attrName: string, oldVal: string, newVal: string) => {
        // the browser has just informed us that an attribute
        // on the host element has changed
        this.attributeChanged(attrToProp, attrName, newVal);
      };

      // add getters/setters to the host element members
      // these would come from the @Prop and @Method decorators that
      // should create the public API to this component
      this.proxy(entries);
    }
  }
}