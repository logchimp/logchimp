<template>
	<div>
		<header class="form-header">
			<div class="breadcrumbs">
				<router-link to="/dashboard/boards" class="breadcrum-item">
					Boards
				</router-link>
				<div class="breadcrum-divider">/</div>
				<div class="breadcrum-item">
					Create board
				</div>
			</div>

		<create-board redirect="/dashboard/boards" />
	</div>
</template>

<script>
import CreateBoard from "../../../components/board/CreateBoard";

export default {
	name: "DashboardCreateBoard",
	components: {
		CreateBoard
	},
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
	},
	metaInfo() {
		return {
			title: "Create board · Dashboard",
			meta: [
				{
					name: "og:title",
					content: `Create board · Dashboard · ${this.getSiteSittings.title}`
				}
			]
		};
	}
};
</script>

