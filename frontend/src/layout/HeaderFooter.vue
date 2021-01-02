<template>
	<div>
		<Header />
		<div class="container">
			<router-view />
			<power-by />
		</div>
	</div>
</template>

<script>
// components
import Header from "../components/Header";
import PowerBy from "../components/PowerBy";

export default {
	name: "HeaderFooter",
	components: {
		Header,
		PowerBy
	}
}
</script>
