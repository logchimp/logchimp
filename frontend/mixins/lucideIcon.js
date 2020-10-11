import { createElement } from "vue";

// createVueIcon function
const createVueIcon = (iconName, [tag, attrs, children]) => ({
	name: iconName,
	functional: true,
	render(
		createElement,
		{ props: { color = "currentColor", size = 48, strokeWidth = 2 } }
	) {
		return createElement(
			tag,
			{
				attrs: {
					...attrs,
					width: size,
					height: size,
					color,
					strokeWidth
				}
			},
			children.map(([tag, attrs]) => createElement(tag, { attrs }))
		);
	}
});

export default createVueIcon;
