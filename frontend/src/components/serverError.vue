<template>
	<div class="server-error">
		<span>
			Something went wrong! Please try again or contact the site owner.
		</span>
		<close-icon @click.native="$emit('close')" />
	</div>
</template>

<script>
// icons
import CloseIcon from "./icons/Close";

export default {
	name: "ServerError",
	components: {
		CloseIcon
	}
};
</script>
