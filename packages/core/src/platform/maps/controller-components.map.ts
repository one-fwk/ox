import { Injectable } from '@one/core';

import { HostElement } from '../../interfaces';

@Injectable()
export class ControllerComponents extends Map<string, HostElement> {}