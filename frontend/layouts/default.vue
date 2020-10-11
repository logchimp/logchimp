<template>
	<div>
		<Header />
		<div class="container">
			<Nuxt />
		</div>
	</div>
</template>

<script>
// components
import Header from "@/components/Header";

export default {
	name: "HeaderFooter",
	components: {
		Header
	}
};
</script>
