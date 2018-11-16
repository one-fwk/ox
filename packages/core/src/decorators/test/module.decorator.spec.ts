import { Module } from '../module.decorator';
import { METADATA, Reflector } from '@one/core';
import { COMPONENTS } from '@onex/core/tokens';

describe('@Module()', () => {
  let obj: any;

  beforeEach(() => obj = {});

  it('should define provider metadata', () => {
    Module({
      providers: [obj],
    })(obj);

    const providers = Reflector.get(METADATA.PROVIDERS, obj);
    expect(providers).toEqual(jasmine.arrayContaining([obj]));
  });

  it('should define declarations as provider metadata', () => {
    Module({
      declarations: [obj],
    })(obj);

    const providers = Reflector.get(METADATA.PROVIDERS, obj);
    expect(providers).toEqual(
      jasmine.arrayContaining([{
        provide: COMPONENTS,
        useValue: obj,
        multi: true,
      }]),
    );
  });
});