<template>
	<div>
		<Header />
		<div class="container">
			<router-view />
		</div>
	</div>
</template>

<script>
// components
import Header from "../components/layout/Header";

export default {
	name: "HeaderFooter",
	components: {
		Header
	}
}
</script>
