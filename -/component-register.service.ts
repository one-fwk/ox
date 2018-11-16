/*import { Inject, Injectable, Injector, Type } from '@one/core';

// import { createComponentElement } from './create-component-element';
// import { MetadataStorage } from './metadata-storage';

// Use Zone.js for observing changes to component state
@Injectable()
export class ComponentRegisterService {
  @Inject(Injector)
  private readonly injector: Injector;

  register(componentRef: Type<any>) {
    const metadata = MetadataStorage.getComponent(componentRef);

    return createComponentElement({
      injector: this.injector,
      componentRef,
      metadata,
    });
  }
}*/