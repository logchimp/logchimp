<template>
	<div>
		<div class="boards-page-header">
			<h4 class="boards-page-header-heading">Create Board</h4>
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

