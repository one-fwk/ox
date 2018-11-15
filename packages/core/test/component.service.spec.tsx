import { h, Component, Element, ViewChild, Prop } from '@onex/core';
import { expectError, getChildNodes } from '@onex/core/util';
import { Test } from '@one/testing';

import { ComponentRegisterService } from '@onex/core/component-register.service';

@Component({
  selector: 'app-root',
})
class AppComponent {
  @Element() el!: HTMLElement;

  render() {
    return [
      <div />,
      <div />,
    ];
  }
}

describe('ComponentRegisterService', () => {
  let components: ComponentRegisterService;

  beforeAll(async () => {
    const test = await Test.createTestingModule({
      providers: [ComponentRegisterService],
    }).compile();

    components = test.get(ComponentRegisterService);
    await components.register(AppComponent);
  });

  it('should have element name defined as component name', () => {
    const appEl = <app-root />;
    expect(appEl.constructor.name).toEqual(AppComponent.name);
  });

  it('should have fragmented children', () => {
    const appEl = <app-root />;
    document.body.appendChild(appEl);

    const childNodes = getChildNodes(appEl);
    expect(childNodes).toEqual(
      jasmine.arrayContaining([
        <div />,
        <div />,
      ]),
    );
  });

  it('should have prop', async () => {
    @Component({
      selector: 'test-root',
    })
    class TestComponent {
      @Prop() todo: string;

      render() {
        return this.todo;
      }
    }

    await components.register(TestComponent);

    const testEl = <test-root todo="tests" />;
    document.body.appendChild(testEl);

    expect((testEl as any)._component.todo).toEqual('tests');
  });

  it('should have view child', async () => {
    @Component({
      selector: 'test-root',
    })
    class TestComponent {
      @ViewChild(AppComponent) appRoot: HTMLElement;

      render() {
        return <app-root test="lol" />;
      }
    }

    await components.register(TestComponent);

    const testEl = <test-root />;
    document.body.appendChild(testEl);

    const appEl = testEl.querySelector('app-root');
    expect((testEl as any)._component.appRoot).toEqual(appEl);
  });

  it('should throw error if already declared', () => {
    return expectError(() => components.register(AppComponent));
  });

  it('should have element', () => {
    const appEl = <app-root />;
    document.body.appendChild(appEl);

    const app = (appEl as any).component;
    expect(app.el).toEqual(appEl);
  });

  it('should create element', () => {
    expect(() => {
      document.body.appendChild(<app-root />);
    }).not.toThrow();
  });
});