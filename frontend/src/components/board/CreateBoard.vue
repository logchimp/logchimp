<template>
	<Form class="form__container">
		<l-text
			v-model="boardName.value"
			label="Name"
			type="text"
			name="Name"
			placeholder="Name of the board"
			:error="boardName.error"
			@keydown.native="boardNameHandler"
			@keyup.native.enter="createBoard"
			class="board__form-item"
		/>
		<Button
			:loading="buttonLoading"
			@click="createBoard"
			type="primary"
			class="board__form-button"
		>
			Create
		</Button>
	</Form>
</template>

<script>
// packages
import axios from "axios";

// components
import Form from "../Form";
import LText from "../input/LText";
import Button from "../Button";

export default {
	name: "CreateBoard",
	data() {
		return {
			boardName: {
				value: "",
				error: {
					show: false,
					message: "Required"
				}
			},
			buttonLoading: false
		};
	},
	components: {
		Form,
		LText,
		Button
	},
	methods: {
		boardNameHandler() {
			this.boardName.error.show = false;
		},
		createBoard() {
			if (this.boardName.value) {
				if (!this.buttonLoading) {
					this.buttonLoading = true;
					const token = this.$store.getters["user/getAuthToken"];
					axios({
						method: "post",
						url: `${process.env.VUE_APP_SEVER_URL}/api/v1/boards`,
						data: {
							name: this.boardName.value
						},
						headers: {
							Authorization: `Bearer ${token}`
						}
					})
						.then(response => {
							if (response.status === 201) {
								this.$router.push("/dashboard/boards");
								this.buttonLoading = false;
							}
						})
						.catch(error => {
							console.log(error);
							this.buttonLoading = false;
						});
				}
			} else {
				this.boardName.error.show = true;
			}
		}
	}
};
</script>

<style lang="sass" scoped>
.board__form-container
	margin-top: 2rem

.board__form-item
	width: 350px

.board__form-button
	margin-top: 2rem
</style>
