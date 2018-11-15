import { ComponentRegistry } from '../../platform';
import { Patch } from '../patch.service';
import { VNode } from '../../interfaces';
import { h } from '../h';

function prop(name: any) {
  return function(obj: any) {
    return obj[name];
  };
}

function map(fn: any, list: any) {
  const ret = [];
  for (let i = 0; i < list.length; ++i) {
    ret[i] = fn(list[i]);
  }
  return ret;
}

describe('renderer', () => {
  const cmpRegistry = new ComponentRegistry();
  const { patch } = new Patch(cmpRegistry);

  let hostElm: any;
  let vnode0: VNode;
  const inner = prop('innerHTML');

  beforeEach(() => {
    hostElm = document.createElement('div');
    vnode0 = {};
    vnode0.elm = hostElm;
  });

  describe('functional component', () => {
    it('should re-render functional component w/ children', () => {
      const DoesNotRenderChildren = () => h('div', null, 'mph');
      const RendersChildren = (props, children) => h('div', null, children, '-12');

      hostElm = document.createElement('my-tag');

      const vnode0 = {} as VNode;
      vnode0.elm = hostElm;

      const vnode1 = h('my-tag', null,
        h(DoesNotRenderChildren, null, '88'),
        h(RendersChildren, null, 'DMC'),
      );

      hostElm = patch(hostElm, vnode0, vnode1).elm;
      expect(hostElm.tagName).toBe('MY-TAG');
      expect(hostElm.childNodes[0].innerHTML).toBe('mph');
      expect(hostElm.childNodes[1].innerHTML).toBe('DMC-12');

      const vnode2 = h('my-tag', null,
        h(DoesNotRenderChildren, null, '88'),
        h(RendersChildren, null, 'dmc')
      );

      hostElm = patch(hostElm, vnode1, vnode2).elm;
      expect(hostElm.childNodes[0].innerHTML).toBe('mph');
      expect(hostElm.childNodes[1].innerHTML).toBe('dmc-12');
    });
  });
});