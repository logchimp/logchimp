<template>
  <div
    :class="[
      'flex-1',
      {
        'flex items-center': loading || errorCode
      }
    ]"
  >
    <LoaderContainer v-if="loading" />
    <RoleEditor
      v-else-if="role.id && !errorCode"
      :title="title"
      :role="role"
      :permissions="permissions"
    />
    <Dashboard404 v-else-if="errorCode === 'ROLE_NOT_FOUND'">
      Role not found
    </Dashboard404>
    <Dashboard500 v-else>
      Something went wrong.
    </Dashboard500>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useHead } from "@vueuse/head";
import type {
  IRole,
  PermissionAction,
  TPermissionEntities,
  IPermissionsState,
} from "@logchimp/types";

// modules
import { router } from "../../../../../router";
import { getRole } from "../../../../modules/roles";

// components
import Dashboard404 from "../../../../../components/dashboard/404.vue";
import Dashboard500 from "../../../../../components/dashboard/500.vue";
import LoaderContainer from "../../../../../components/ui/LoaderContainer.vue";
import RoleEditor from "../../../../components/roles/RoleEditor.vue";

const errorCode = ref<string | undefined>();
const loading = ref<boolean>(false);

const title = ref("");
const role = ref<IRole>({
  id: "",
  name: "",
  description: "",
  created_at: new Date(),
  updated_at: new Date(),
});
const permissions = reactive<IPermissionsState>({
  post: {
    create: false,
    read: false,
    update: false,
    destroy: false,
  },
  board: {
    create: false,
    read: false,
    update: false,
    destroy: false,
    assign: false,
    unassign: false,
  },
  roadmap: {
    create: false,
    read: false,
    update: false,
    destroy: false,
    assign: false,
    unassign: false,
  },
  vote: {
    create: false,
    destroy: false,
    assign: false,
    unassign: false,
  },
  dashboard: {
    read: false,
  },
  role: {
    create: false,
    read: false,
    update: false,
    destroy: false,
    assign: false,
    unassign: false,
  },
  settings: {
    read: false,
    update: false,
  },
});

async function getRoleHandler(id: string) {
  loading.value = true;
  errorCode.value = undefined;

  try {
    const response = await getRole(id);

    title.value = response.data.role.name;
    role.value = response.data.role;

    const permissionsList = response.data.role.permissions;
    permissionsList.forEach((permission) => {
      const parts = permission.split(":");
      if (parts.length !== 2) {
        console.warn("Invalid permission format:", permission);
        return;
      }
      const [type, action] = parts as [TPermissionEntities, PermissionAction];
      const permissionGroup = permissions[type];
      if (!permissionGroup) return;
      if (action in permissionGroup) {
        (permissionGroup as Record<string, boolean>)[action] = true;
      }
    });
  } catch (err) {
    console.error(err);
    // @ts-expect-error
    errorCode.value = err.response.data.code;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  const route = router.currentRoute.value;
  const idParam = (route.params.id || "").toString();
  if (idParam) {
    getRoleHandler(idParam);
  } else {
    router.push("/dashboard/settings/roles");
  }
});

useHead({
  title: () => `${title.value ? `${title.value} • ` : ""}Role • Dashboard`,
});

defineOptions({
  name: "DashboardRoleEdit",
});
</script>
