import { HostElement, MemberMeta } from '../interfaces';
import { PlatformService } from '../platform';

export class EventEmitter {
  constructor(
    private readonly platform: PlatformService,
    private readonly memberMeta: MemberMeta,
    private readonly hostElm: HostElement,
  ) {}

  public emit(data: any) {
    const eventDetails = {
      bubbles: this.memberMeta.bubbles,
      composed: this.memberMeta.composed,
      cancelable: this.memberMeta.cancelable,
      detail: data,
    };

    this.platform.dispatchEvent(
      this.hostElm,
      this.memberMeta.memberName,
      eventDetails,
    );
  }
}