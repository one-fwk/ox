import { EventMeta, HostElement } from '../interfaces';
import { PlatformService } from './platform.service';

export class EventEmitter {
  constructor(
    private readonly meta: EventMeta,
    private readonly plt: PlatformService,
    private readonly elm: HostElement,
  ) {}

  public emit(data: any) {
    this.plt.dispatchEvent(this.elm, this.meta.name, {
      bubbles: this.meta.bubbles,
      composed: this.meta.composed,
      cancelable: this.meta.cancelable,
      detail: data,
    });
  }
}