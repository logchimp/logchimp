<template>
	<div class="container">
		<!-- Page not found -->
		<p v-if="error.statusCode === 404">Page not found</p>

		<!-- Post not found -->
		<p v-if="error.code === 'POST_NOT_FOUND'">Post not found</p>

		<!-- Board not found -->
		<p v-if="error.code === 'BOARD_NOT_FOUND'">Board not found</p>
	</div>
</template>

<script>
export default {
	props: ["error"],
	layout: "viewer"
};
</script>
