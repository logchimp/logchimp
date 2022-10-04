import { computed, ref } from "vue";
import { defineStore } from "pinia";

type AlertType = 'success' | 'warning' | 'error'

export interface AlertObjectType {
	title: string
	type: AlertType
	time?: number
	timeout: number
}

export const useAlertStore = defineStore('alerts', () => {
	const alert = ref<AlertObjectType[]>([]);

	const getAlerts = computed(() => alert.value)

	function add({ title, type, timeout }: AlertObjectType) {
		const alertObject = {
      title,
      type,
      time: Date.now(),
      timeout,
    };

		alert.value.push(alertObject)
	}

	function remove(payload: any) {
    alert.value.splice(payload, 1);
  }

	return {
		// state
		alert,

		// getters
		getAlerts,

		// actions
		add,
		remove,
	}
})
