import { MEMBER_TYPE, Metadata, EventOptions, PropOptions } from '@ox/collection';

export function createMemberDecorator<T>(memberType: MEMBER_TYPE) {
  return (options?: T): PropertyDecorator | MethodDecorator => {
    return (target, memberName) => {
      Metadata.members.add({
        target: target.constructor,
        memberName,
        memberType,
        ...(options || {}),
      });
    };
  };
}

export const Event = createMemberDecorator<EventOptions>(MEMBER_TYPE.Event);
export const Prop = createMemberDecorator<PropOptions>(MEMBER_TYPE.Prop);
export const Element = createMemberDecorator(MEMBER_TYPE.Element);
export const Method = createMemberDecorator(MEMBER_TYPE.Method);
export const State = createMemberDecorator(MEMBER_TYPE.State);