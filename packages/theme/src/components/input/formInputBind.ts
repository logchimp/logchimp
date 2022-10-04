export const formInputBind = {
	modelValue: {
		type: String,
		default: ""
	}
}

const findBindEmit = defineEmits(['update:modelValue'])

export function input(event: any) {
	findBindEmit('update:modelValue', event.target.value)
}
