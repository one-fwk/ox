import { ComponentConstructorEvent, HostElement } from '../interfaces';
import { PlatformService } from './platform.service';

export class EventEmitter {
  constructor(
    private readonly eventMeta: ComponentConstructorEvent,
    private readonly plt: PlatformService,
    private readonly elm: HostElement,
  ) {}

  public emit(data: any) {
    this.plt.dispatchEvent(this.elm, this.eventMeta.name, {
      bubbles: this.eventMeta.bubbles,
      composed: this.eventMeta.composed,
      cancelable: this.eventMeta.cancelable,
      detail: data,
    });
  }
}