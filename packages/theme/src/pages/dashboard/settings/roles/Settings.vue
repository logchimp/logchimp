<template>
  <div>
    <header class="form-header">
      <breadcrumbs>
        <router-link to="/dashboard/settings/roles" class="breadcrum-item">
          Roles
        </router-link>

        <!-- Show divider & title once data loaded -->
        <template v-if="title">
          <div class="breadcrum-divider">
            /
          </div>
          <h5 class="breadcrum-item">
            {{ title }}
          </h5>
        </template>
      </breadcrumbs>

      <Button
        type="primary"
        :loading="updateRoleButtonLoading"
        :disabled="updateRoleButtonDisabled"
        @click="updateRoleHandler"
      >
        Save
      </Button>
    </header>

    <div class="form-section">
      <div class="form-columns">
        <div class="form-column">
          <l-text v-model="role.name" label="Name" placeholder="Role name" />
        </div>

        <div class="form-column">
          <l-textarea
            v-model="role.description"
            label="Description"
            rows="4"
            name="Role description"
            placeholder="What's about this role?"
          />
        </div>
      </div>
    </div>

    <div class="form-section">
      <p class="form-section-title">Posts permissions</p>
      <div class="form-columns">
        <div class="form-column">
          <toggle-item v-model="permissions.post.read" label="Read" />
          <toggle-item
            v-model="permissions.post.update"
            label="Update"
            note="Allows users to edit post submitted by other users."
          />
        </div>

        <div class="form-column">
          <toggle-item v-model="permissions.post.create" label="Create" />
          <toggle-item v-model="permissions.post.destroy" label="Delete" />
        </div>
      </div>
    </div>

    <div class="form-section">
      <p class="form-section-title">Boards permissions</p>
      <div class="form-columns">
        <div class="form-column">
          <toggle-item v-model="permissions.board.read" label="Read" />
          <toggle-item v-model="permissions.board.update" label="Update" />
          <toggle-item v-model="permissions.board.assign" label="Assign" />
        </div>

        <div class="form-column">
          <toggle-item v-model="permissions.board.create" label="Create" />
          <toggle-item v-model="permissions.board.destroy" label="Delete" />
          <toggle-item v-model="permissions.board.unassign" label="Unassign" />
        </div>
      </div>
    </div>

    <div class="form-section">
      <p class="form-section-title">Roadmaps permissions</p>
      <div class="form-columns">
        <div class="form-column">
          <toggle-item v-model="permissions.roadmap.read" label="Read" />
          <toggle-item v-model="permissions.roadmap.update" label="Update" />
          <toggle-item v-model="permissions.roadmap.assign" label="Assign" />
        </div>

        <div class="form-column">
          <toggle-item v-model="permissions.roadmap.create" label="Create" />
          <toggle-item v-model="permissions.roadmap.destroy" label="Delete" />
          <toggle-item
            v-model="permissions.roadmap.unassign"
            label="Unassign"
          />
        </div>
      </div>
    </div>

    <div class="form-section">
      <p class="form-section-title">Vote permissions</p>
      <div class="form-columns">
        <div class="form-column">
          <toggle-item v-model="permissions.vote.create" label="Create" />
          <toggle-item v-model="permissions.vote.destroy" label="Delete" />
        </div>

        <div class="form-column">
          <toggle-item v-model="permissions.vote.assign" label="Assign" />
          <toggle-item v-model="permissions.vote.unassign" label="Unassign" />
        </div>
      </div>
    </div>

    <div class="form-section">
      <p class="form-section-title">Dashboard permissions</p>
      <div class="form-columns">
        <div class="form-column">
          <toggle-item v-model="permissions.dashboard.read" label="Read" />
        </div>
      </div>
    </div>

    <div class="form-section">
      <p class="form-section-title">Roles permissions</p>
      <div class="form-columns">
        <div class="form-column">
          <toggle-item v-model="permissions.role.read" label="Read" />
          <toggle-item v-model="permissions.role.update" label="Update" />
          <toggle-item v-model="permissions.role.assign" label="Assign" />
        </div>

        <div class="form-column">
          <toggle-item v-model="permissions.role.create" label="Create" />
          <toggle-item v-model="permissions.role.destroy" label="Delete" />
          <toggle-item v-model="permissions.role.unassign" label="Unassign" />
        </div>
      </div>
    </div>

    <div class="form-section">
      <p class="form-section-title">Settings permissions</p>
      <div class="form-columns">
        <div class="form-column">
          <toggle-item v-model="permissions.settings.read" label="Read" />
        </div>

        <div class="form-column">
          <toggle-item v-model="permissions.settings.update" label="Update" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
	name: "DashboardRoleEdit",
}
</script>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { router } from "../../../../router"
import {useUserStore} from "../../../../store/user"
import { getRole, updateRole } from "../../../../modules/roles";

// components
import Button from "../../../../components/ui/Button.vue";
import LText from "../../../../components/ui/input/LText.vue";
import LTextarea from "../../../../components/ui/input/LTextarea.vue";
import ToggleItem from "../../../../components/ui/input/ToggleItem.vue";
import Breadcrumbs from "../../../../components/Breadcrumbs.vue";

const { permissions: userPermissions } = useUserStore()

const title = ref("")
// TODO: Add TS types
const role = ref<any>({})
const permissions = reactive({
	post: {
		create: false,
		read: false,
		update: false,
		destroy: false
	},
	board: {
		create: false,
		read: false,
		update: false,
		destroy: false,
		assign: false,
		unassign: false
	},
	roadmap: {
		create: false,
		read: false,
		update: false,
		destroy: false,
		assign: false,
		unassign: false
	},
	vote: {
		create: false,
		destroy: false,
		assign: false,
		unassign: false
	},
	dashboard: {
		read: false
	},
	role: {
		create: false,
		read: false,
		update: false,
		destroy: false,
		assign: false,
		unassign: false
	},
	settings: {
		read: false,
		update: false
	}
})
const updateRoleButtonLoading = ref(false)

const updateRoleButtonDisabled = computed(() => {
	const checkPermission = userPermissions.includes("role:update");
	return !checkPermission;
})

async function updateRoleHandler() {
	updateRoleButtonLoading.value = true;

	const activePermissions = [] as unknown;
	for (let i in permissions) {
		let type = i;

    // @ts-ignore
		for (let j in permissions[i]) {
			let action = j;
      // @ts-ignore
			if (permissions[i][j]) {
        // @ts-ignore
				activePermissions.push(`${type}:${action}`);
			}
		}
	}

	try {
		const response = await updateRole({
			id: role.value.id,
			name: role.value.name,
			description: role.value.description,
			permissions: activePermissions
		});

		if (response.status === 200) {
			router.push("/dashboard/settings/roles");
		}
	} catch (err) {
		console.error(err);
	} finally {
		updateRoleButtonLoading.value = false;
	}
}

async function getRoleHandler() {
	const route = router.currentRoute.value;

	if (route.params.id) {
		try {
			const id = route.params.id.toString();
			const response = await getRole(id);

			title.value = response.data.role.name;
			role.value = response.data.role;

			const permissionsList = response.data.role.permissions;
			for (let i = 0; i < permissionsList.length; i++) {
				const type = permissionsList[i].split(":")[0];
				const action = permissionsList[i].split(":")[1];

        // @ts-ignore
				permissions[type][action] = true;
			}
		} catch (err) {
			console.error(err);
		}
	}
}

onMounted(() => getRoleHandler())

useHead({
	title: () => `${title.value ? `${title.value} • ` : ''}Role • Dashboard`
})
</script>
