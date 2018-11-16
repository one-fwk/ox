import { Injectable } from "@one/core";

import { HostElement, VNode } from '../interfaces';
import { PatchService } from './patch.service';

@Injectable()
export class RendererService {
  constructor(private readonly patch: PatchService) {}

  public patch(
    hostElm: HostElement,
    oldVNode: VNode,
    newVNode: VNode,
    ...rest: any[],
  ) {
    return this.patch.patch(hostElm, oldVNode, newVNode, ...rest);
  }
}