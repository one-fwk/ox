import { isDisconnected } from '../util';

describe('utilities', () => {
  describe('isDisconnected', () => {
    let elm: HTMLDivElement;

    beforeEach(() => elm = document.createElement('div'));

    it('should not be disconnected when elm has parentNode', () => {
      const parentNode = document.createElement('div');
      parentNode.appendChild(elm);
      expect(isDisconnected(elm)).toBe(true);
    });

    it('should be disconnected when elm has no parentNode', () => {
      expect(isDisconnected(elm)).toBe(true);
    });

    it('should be cool if its a null/undefined elm', () => {
      expect(isDisconnected(null)).toBeUndefined();
    });
  });
});