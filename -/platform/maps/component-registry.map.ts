import { Injectable } from '@one/core';

import { ComponentMeta } from '../../interfaces';

@Injectable()
export class ComponentRegistry extends Map<string, ComponentMeta> {}