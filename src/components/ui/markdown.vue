<template>
	<div class="markdown" v-html="postBodyMarkdown" />
</template>

<script>
// packages
import renderer from "remark";
import recommended from "remark-preset-lint-recommended";
import html from "remark-html";

export default {
	name: "Markdown",
	props: {
		markdown: {
			type: String
		}
	},
	computed: {
		postBodyMarkdown() {
			let content;
			renderer()
				.use(recommended)
				.use(html)
				.process(this.markdown, function(err, file) {
					if (err) console.error(err);
					content = file.contents;
				});
			return content;
		}
	}
};
</script>
