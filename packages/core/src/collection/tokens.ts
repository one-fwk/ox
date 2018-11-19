import { InjectionToken } from '@one/core';
import { ComponentInstance } from '../interfaces';

export const COMPONENT_META = Symbol.for('COMPONENT_META');
export const COMPONENT_STATE = Symbol.for('COMPONENT_STATE');

export const COMPONENTS = new InjectionToken<ComponentInstance[]>('COMPONENT_TOKEN');
// this will fire when all components have finished loaded
export const PLATFORM_INIT = new InjectionToken<any>('PLATFORM_INIT');
export const PLATFORM_OPTIONS = new InjectionToken<any>('PLATFORM_OPTIONS');