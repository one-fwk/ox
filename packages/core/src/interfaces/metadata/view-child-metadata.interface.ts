import { TargetPropertyRef, Type } from '@one/core';

export interface ViewChildMetadata extends TargetPropertyRef {
  child: Type<any>;
}