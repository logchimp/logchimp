<template>
	<Form>
		<l-text
			v-model="boardName.value"
			label="Name"
			type="text"
			name="Name"
			placeholder="Name of the board"
			:error="boardName.error"
			@keyup-enter="create"
			@hide-error="hideBoardNameError"
		/>
		<div style="display: flex; justify-content: center;">
			<Button :loading="buttonLoading" @click="create" type="primary">
				Create
			</Button>
		</div>
	</Form>
</template>

<script>
// modules
import { createBoard } from "../../modules/boards";

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
					message: ""
				}
			},
			buttonLoading: false
		};
	},
	props: {
		redirect: {
			type: String,
			required: true
		}
	},
	components: {
		Form,
		LText,
		Button
	},
	methods: {
		hideBoardNameError(event) {
			this.boardName.error = event;
		},
		async create() {
			if (!this.boardName.value) {
				this.boardName.error.show = true;
				this.boardName.error.message = "Required";
				return;
			}

			this.buttonLoading = true;

			try {
				await createBoard(this.boardName.value);

				this.$router.push(this.redirect);
			} catch (error) {
				console.error(error);
			} finally {
				this.buttonLoading = false;
			}
		}
	}
};
</script>
