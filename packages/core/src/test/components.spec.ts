import { Test } from '@ox/testing';

describe('render components', () => {
  it('should be able to resolve providers', async () => {
    const module = await Test.createOxTestingModule({
      declarations: [],
      providers: [],
    }).compile();
  });

  it('should be able to resolve imports', async () => {
    const module = await Test.createOxTestingModule({
      declarations: [],
      imports: [],
    }).compile();
  });

  it('test', async () => {
    const module = await Test.createOxTestingModule({
      declarations: [],
      providers: [],
    }).compile();
  });
});