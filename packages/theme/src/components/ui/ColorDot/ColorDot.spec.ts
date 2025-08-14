import { mount } from '@vue/test-utils';
import ColorDot from './ColorDot.vue';

describe('ColorDot', () => {
  it.each([
    ['ff0000', 'rgb(255, 0, 0)'],
    ['00ff00', 'rgb(0, 255, 0)'],
    ['0000ff', 'rgb(0, 0, 255)'],
  ])('renders background color #%s correctly', (hex, rgb) => {
    const wrapper = mount(ColorDot, { props: { color: hex } });
    const dot = wrapper.get('[data-test="color-dot"]');

    expect(dot.exists()).toBe(true);
    expect(dot.element.style.backgroundColor).toBe(rgb);
  });
})
