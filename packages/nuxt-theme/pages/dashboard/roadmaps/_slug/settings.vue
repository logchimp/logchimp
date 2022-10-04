<template>
	<div>
		<header class="form-header">
			<div class="breadcrumbs">
				<a href="/dashboard/roadmaps" class="breadcrum-item">
					Roadmaps
				</a>
				<div class="breadcrum-divider">/</div>
				<h5 class="breadcrum-item">
					{{ title }}
				</h5>
			</div>

			<Button
				type="primary"
				:loading="updateButtonLoading"
				:disabled="updateRoadmapButtonDisabled"
				@click="update"
			>
				Save
			</Button>
		</header>

		<div class="form-section">
			<div class="form-columns">
				<div class="form-column">
					<l-text
						v-model="roadmap.name"
						label="Name"
						placeholder="Enter roadmap name"
					/>

					<color-input v-model="roadmap.color" />
				</div>

				<div class="form-column">
					<l-text
						v-model="roadmap.url"
						label="Slug"
						placeholder="Roadmap slug url"
						:description="slimUrl"
					/>
				</div>
			</div>
		</div>

		<div class="form-section">
			<h6 class="form-section-title">Privacy</h6>
			<div class="form-columns">
				<div class="form-column">
					<toggle-item
						v-model="roadmap.display"
						label="Display on site"
						note="Show this roadmap on the site"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters } from "vuex";

// components
import Button from "../../../../components/ui/Button.vue";
import LText from "../../../../components/ui/LText.vue";
import ToggleItem from "../../../../components/ui/ToggleItem.vue";
import ColorInput from "../../../../components/ui/ColorInput.vue";

export default {
	name: "DashbordRoadmapSettings",
	layout: "dashboard",
	components: {
		// components
		Button,
		LText,
		ToggleItem,
		ColorInput
	},
	data() {
		return {
			title: "",
			roadmap: {
				name: "",
				url: "",
				color: "",
				display: false
			},
			updateButtonLoading: false
		};
	},
	computed: {
		...mapGetters("settings", {
			settings: "get"
		}),
		updateRoadmapButtonDisabled() {
			const permissions = this.$store.getters["user/getPermissions"];
			const checkPermission = permissions.includes("roadmap:update");
			return !checkPermission;
		},
		slimUrl() {
			return this.roadmap.url
				.replace(/[^\w]+/gi, "-")
				.trim()
				.toLowerCase();
		}
	},
	created() {
		this.getRoadmap();
	},
	methods: {
		async update() {
			this.updateButtonLoading = true;

			try {
				const token = this.$store.getters["user/getAuthToken"];

				const response = await this.$axios({
					method: "PATCH",
					url: "/api/v1/roadmaps",
					data: {
						...this.roadmap,
						id: this.roadmap.id
					},
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				if (response.status === 200) {
					this.$router.push("/dashboard/roadmaps");
				}
				this.updateButtonLoading = false;
			} catch (err) {
				this.updateButtonLoading = false;
				console.error(err);
			}
		},
		async getRoadmap() {
			try {
				const url = this.$route.params.slug;

				const response = await this.$axios({
					method: "GET",
					url: `/api/v1/roadmaps/${url}`
				});

				this.roadmap = response.data.roadmap;
				this.title = response.data.roadmap.name;
			} catch (err) {
				console.error(err);
			}
		}
	},
	head() {
		return {
			title: `${this.title} • Roadmap • Dashboard • ${this.settings.title}`
		};
	}
};
</script>
