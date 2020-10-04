<template>
	<div>
		<div class="boards-page-header">
			<h4 class="boards-page-header-heading">Settings</h4>
		</div>
		<div>
			<div class="dashboard-settings-logo">
				<label class="input-field-label" for="logo">Logo</label>
				<img :src="logo" :alt="siteName.value" />
			</div>
			<l-text
				v-model="siteName.value"
				label="Site name"
				type="text"
				name="Site name"
				placeholder="My awesome site"
				:error="siteName.error"
				@hide-error="hideSiteNameError"
			/>
			<l-text
				v-model="description.value"
				label="Description"
				type="text"
				name="Description"
				placeholder="Site description"
				:error="description.error"
				@hide-error="hideDescriptionError"
			/>
			<div style="display: flex; align-items: center;">
				<l-text
					v-model="accentColor.value"
					label="Color"
					type="text"
					name="Color"
					placeholder="484d7c"
					:error="accentColor.error"
					@hide-error="hideAccentColorError"
				/>
				<div class="dashboard-settings-color-border">
					<div
						class="dashboard-settings-color-preview"
						:style="{
							backgroundColor: `#${accentColor.value}`
						}"
					/>
				</div>
			</div>
			<div style="display: flex;">
				<Button :loading="buttonLoading" @click="saveSettings" type="primary">
					Save
				</Button>
			</div>
		</div>
	</div>
</template>

<script>
// packages
import axios from "axios";

// components
import LText from "../../components/input/LText";
import Button from "../../components/Button";

export default {
	name: "DashboardSettings",
	data() {
		return {
			siteName: {
				value: "",
				error: {
					show: false,
					message: ""
				}
			},
			logo: "",
			description: {
				value: "",
				error: {
					show: false,
					message: ""
				}
			},
			accentColor: {
				value: "484d7c",
				error: {
					show: false,
					message: ""
				}
			},
			buttonLoading: false
		};
	},
	components: {
		// components
		LText,
		Button
	},
	methods: {
		hideSiteNameError(event) {
			this.siteName.error = event;
		},
		hideDescriptionError(event) {
			this.description.error = event;
		},
		hideAccentColorError(event) {
			this.accentColor.error = event;
		},
		saveSettings() {
			if (this.siteName.value && this.accentColor.value) {
				const token = this.$store.getters["user/getAuthToken"];

				axios({
					method: "patch",
					url: `${process.env.VUE_APP_SEVER_URL}/api/v1/site`,
					data: {
						title: this.siteName.value,
						description: this.description.value,
						accentColor: this.accentColor.value
					},
					headers: {
						Authorization: `Bearer ${token}`
					}
				})
					.then(response => {
						this.siteName.value = response.data.settings.title;
						this.logo = response.data.settings.logo;
						this.description.value = response.data.settings.description;
						this.accentColor.value = response.data.settings.accentColor;
					})
					.catch(error => {
						console.error(error);
					});
			} else {
				if (!this.siteName.value) {
					this.siteName.error.show = true;
					this.siteName.error.message = "Required";
				}

				if (!this.accentColor.value) {
					this.accentColor.error.show = true;
					this.accentColor.error.message = "Required";
				}
			}
		},
		getSettings() {
			axios({
				method: "get",
				url: `${process.env.VUE_APP_SEVER_URL}/api/v1/site`
			})
				.then(response => {
					this.siteName.value = response.data.settings.title;
					this.logo = response.data.settings.logo;
					this.description.value = response.data.settings.description;
					this.accentColor.value = response.data.settings.accentColor;
				})
				.catch(error => {
					console.error(error);
				});
		}
	},
	created() {
		this.getSettings();
	}
};
</script>
