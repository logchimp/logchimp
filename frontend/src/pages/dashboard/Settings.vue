<template>
	<div>
		<div class="boards-page-header">
			<h4 class="boards-page-header-heading">Settings</h4>
		</div>
		<div>
			<div class="dashboard-settings-logo">
				<label class="input-field-label" for="logo">Logo</label>
				<div class="dashboard-settings-logo-placeholder">
					<img @click="selectFileHandler" :src="logo" :alt="siteName.value" />
				</div>
				<input
					ref="fileSelector"
					accept="image/jpg,image/jpeg,image/png,image/svg+xml"
					type="file"
					name="logo"
					style="display: none"
					@change="uploadFile"
				/>
			</div>
			<l-text
				v-model="siteName.value"
				label="Site name"
				type="text"
				name="Site name"
				placeholder="My awesome site"
				:error="siteName.error"
				@keyup-enter="saveSettings"
				@hide-error="hideSiteNameError"
			/>
			<l-text
				v-model="description.value"
				label="Description"
				type="text"
				name="Description"
				placeholder="Site description"
				:error="description.error"
				@keyup-enter="saveSettings"
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
					@keyup-enter="saveSettings"
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
			<l-text
				v-model="googleAnalyticsId.value"
				label="Google Analytics"
				type="text"
				name="Google Analytics ID"
				placeholder="UA-12345678-0"
				:error="googleAnalyticsId.error"
				@keyup-enter="saveSettings"
				@hide-error="hideGoogleAnalyticsError"
			/>
			<div style="display: flex;">
				<Button :loading="buttonLoading" @click="saveSettings" type="primary">
					Save
				</Button>
			</div>
		</div>
	</div>
</template>

<script>
// modules
import { updateSettings } from "../../modules/site";

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
			googleAnalyticsId: {
				value: "",
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
	computed: {
		getSiteSittings() {
			return this.$store.getters["settings/get"];
		}
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
		hideGoogleAnalyticsError(event) {
			this.googleAnalyticsId.error = event;
		},
		selectFileHandler() {
			this.$refs.fileSelector.click();
		},
		uploadFile(event) {
			const token = this.$store.getters["user/getAuthToken"];
			const logo = event.target.files[0];

			const formData = new FormData();
			formData.append("logo", logo);

			axios({
				method: "post",
				url: "/api/v1/settings/update-logo",
				data: formData,
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "multipart/form-data"
				}
			})
				.then(response => {
					this.logo = response.data.settings.logo;

					this.$store.dispatch("settings/updateLogo", {
						logo: response.data.settings.logo
					});
				})
				.catch(error => {
					console.log(error);
				});
		},
		async saveSettings() {
			if (this.buttonLoading) {
				return;
			}

			if (!(this.siteName.value && this.accentColor.value)) {
				if (!this.siteName.value) {
					this.siteName.error.show = true;
					this.siteName.error.message = "Required";
				}

				if (!this.accentColor.value) {
					this.accentColor.error.show = true;
					this.accentColor.error.message = "Required";
				}
			}

			this.buttonLoading = true;

			const siteData = {
				title: this.siteName.value,
				description: this.description.value,
				accentColor: this.accentColor.value,
				googleAnalyticsId: this.googleAnalyticsId.value
			};

			try {
				const response = await updateSettings(siteData);

				this.siteName.value = response.data.settings.title;
				this.logo = response.data.settings.logo;
				this.description.value = response.data.settings.description;
				this.accentColor.value = response.data.settings.accentColor;
				this.googleAnalyticsId.value = response.data.settings.googleAnalyticsId;

				this.$store.dispatch("settings/update", response.data.settings);
				this.buttonLoading = false;
			} catch (error) {
				console.error(error);
				this.buttonLoading = false;
			}
		},
		getSettings() {
			axios({
				method: "get",
				url: "/api/v1/settings/site"
			})
				.then(response => {
					this.siteName.value = response.data.settings.title;
					this.logo = response.data.settings.logo;
					this.description.value = response.data.settings.description;
					this.accentColor.value = response.data.settings.accentColor;
					this.googleAnalyticsId.value =
						response.data.settings.googleAnalyticsId;
				})
				.catch(error => {
					console.error(error);
				});
		}
	},
	created() {
		this.getSettings();
	},
	metaInfo() {
		return {
			title: "Site settings · Dashboard",
			meta: [
				{
					name: "og:title",
					content: `Site settings · Dashboard · ${this.getSiteSittings.title}`
				}
			]
		};
	}
};
</script>
