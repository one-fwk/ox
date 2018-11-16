import { InjectionToken, Type } from '@one/core';

export const COMPONENT_METADATA = Symbol.for('COMPONENT_METADATA');
export const COMPONENT_STATE = Symbol.for('COMPONENT_STATE');

export const COMPONENT_TOKEN = new InjectionToken<Type<any>>('COMPONENT_TOKEN');