import {BaseMetadataStorage, Reflector} from '@one/core';
import {COMPONENT_META} from './tokens';
import {MEMBER_TYPE} from './constants';
import {AbstractComponent, ComponentMeta, ListenMeta, MemberMeta, MethodMeta, WatchMeta,} from './interfaces'

  ;

export class Metadata extends BaseMetadataStorage {
  public static listeners = new Set<ListenMeta>();
  public static watchers = new Set<WatchMeta>();
  public static methods = new Set<MethodMeta>();
  public static members = new Set<MemberMeta>();

  private static getListeners(component: AbstractComponent) {
    return this.filterByTarget(this.listeners, component);
  }

  private static getWatchers(component: AbstractComponent) {
    return this.filterByTarget(this.watchers, component);
  }

  private static getMethods(component: AbstractComponent) {
    return this.filterByTarget(this.methods, component)
  }

  private static getMembers(component: AbstractComponent) {
    return this.filterByTarget(this.members, component)
      .map( member => {
        return member.memberType !== MEMBER_TYPE.Prop
          ? member
          : {
            ...member,
            attrName: member.attrName || member.memberName,
          };
      });
  }

  private static filterMemberByType(cmpMeta: ComponentMeta, filterBy: MEMBER_TYPE) {
    return cmpMeta.membersMeta.filter(({ memberType }) => memberType === filterBy);
  }

  public static getMemberMethods(cmpMeta: ComponentMeta): MemberMeta[] {
    return this.filterMemberByType(cmpMeta, MEMBER_TYPE.Method);
  }

  public static getMemberElement(cmpMeta: ComponentMeta): MemberMeta {
    return this.filterMemberByType(cmpMeta, MEMBER_TYPE.Element)[0];
  }

  public static getMemberEvents(cmpMeta: ComponentMeta): MemberMeta[] {
    return this.filterMemberByType(cmpMeta, MEMBER_TYPE.Event);
  }

  public static getMemberProps(cmpMeta: ComponentMeta): MemberMeta[] {
    return this.filterMemberByType(cmpMeta, MEMBER_TYPE.Prop);
  }

  public static getComponentMetadata(component: AbstractComponent) {
    const componentMeta = Reflector.get(COMPONENT_META, component);
    const listenersMeta = this.getListeners(component);
    const watchersMeta = this.getWatchers(component);
    const methodsMeta = this.getMethods(component);
    const membersMeta = this.getMembers(component);

    return {
      ...componentMeta,
      listenersMeta,
      watchersMeta,
      methodsMeta,
      membersMeta,
    } as ComponentMeta;
  }
}