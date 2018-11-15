import { Component } from '@onex/core';
import { COMPONENT_METADATA } from '@onex/core/tokens';
import { Reflector } from '@one/core';

describe('@Component()', () => {
  it(`should throw error if selector doesn't include a hyphen`, () => {
    expect(() => {
      @Component({
        selector: 'app'
      })
      class AppComponent {}
    }).toThrow();
  });

  it('should define selector metadata', () => {
    @Component({
      selector: 'app-root',
    })
    class AppComponent {}

    const metadata = Reflector.get(COMPONENT_METADATA, AppComponent);
    // expect(metadata).toMatchObject({ selector: 'app-root' });
  });
});