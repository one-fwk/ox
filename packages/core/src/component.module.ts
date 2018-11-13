import { APP_INIT, DynamicModule, Injector, Module, MODULE_INIT, ModuleWithProviders, Type } from '@one/core';

import { ComponentRegisterService } from './component-register.service';
import { MetadataStorage } from './metadata-storage';

@Module()
export class ComponentModule {
  private static readonly components = new Set<Type<any>>();

  // Make sure component have <>.prototype.render and is decorat
  static register(...components: Type<any>[]): ModuleWithProviders {
    return {
      module: ComponentModule,
      providers: [
        ComponentRegisterService,
        {
          provide: MODULE_INIT,
          useFactory: (componentReg: ComponentRegisterService) => {
            return Promise.all(
              components.map(component => {
                ComponentModule.components.add(component);
                return componentReg.register(component);
             }),
            );
          },
          deps: [ComponentRegisterService],
          multi: true,
        },
      ],
    };
  }

  static bootstrap(root: HTMLElement, component: Type<any>): DynamicModule {
    const { selector } = MetadataStorage.getComponent(component);
    const imports = [];

    if (!this.components.has(component)) {
      imports.push(ComponentModule.register(component));
    }

    return {
      module: ComponentModule,
      imports,
      providers: [
        {
          provide: APP_INIT,
          useFactory: async () => {
            await customElements.whenDefined(selector);
            root.appendChild(document.createElement(selector));
          },
          multi: true,
        },
      ],
    };
  }
}