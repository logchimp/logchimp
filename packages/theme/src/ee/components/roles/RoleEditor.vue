<template>
  <DashboardPageHeader>
    <template #left>
      <Breadcrumbs>
        <BreadcrumbItem to="/dashboard/settings/roles">
          Roles
        </BreadcrumbItem>

        <template v-if="title">
          <BreadcrumbDivider />
          <BreadcrumbItem>
            {{ title }}
          </BreadcrumbItem>
        </template>
      </Breadcrumbs>
    </template>

    <Button
      type="primary"
      :loading="updateRoleButtonLoading"
      :disabled="updateRoleButtonDisabled"
      @click="updateRoleHandler"
    >
      Save
    </Button>
  </DashboardPageHeader>

  <div class="px-3 lg:px-6">
    <alert
      v-if="permissions.role.assign"
      title="Important"
      description="The `role:assign` permission can cause critical security and access issues, if misused."
      type="error"
      class="mb-6"
    >
      <template #icon>
        <ShieldAlert />
      </template>
    </alert>

    <div class="form-section">
      <div class="form-columns">
        <div class="form-column">
          <l-text v-model="role.name" label="Name" placeholder="Role name" />
        </div>

        <div class="form-column">
          <l-textarea
            :model-value="role.description ?? undefined"
            @update:model-value="(value: string) => role.description = value ?? null"
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
          <toggle-item
            v-model="permissions.post.read"
            label="Read"
            @update:model-value="handlePermissionChange('post', 'read')"
          />
          <toggle-item
            v-model="permissions.post.update"
            label="Update"
            note="Allows users to edit post submitted by other users."
            @update:model-value="handlePermissionChange('post', 'update')"
          />
        </div>

        <div class="form-column">
          <toggle-item
            v-model="permissions.post.create"
            label="Create"
            @update:model-value="handlePermissionChange('post', 'create')"
          />
          <toggle-item
            v-model="permissions.post.destroy"
            label="Delete"
            @update:model-value="handlePermissionChange('post', 'destroy')"
          />
        </div>
      </div>
    </div>

    <div class="form-section">
      <p class="form-section-title">Boards permissions</p>
      <div class="form-columns">
        <div class="form-column">
          <toggle-item
            v-model="permissions.board.read"
            label="Read"
            @update:model-value="handlePermissionChange('board', 'read')"
          />
          <toggle-item
            v-model="permissions.board.update"
            label="Update"
            @update:model-value="handlePermissionChange('board', 'update')"
          />
          <toggle-item
            v-model="permissions.board.assign"
            label="Assign"
            @update:model-value="handlePermissionChange('board', 'assign')"
          />
        </div>

        <div class="form-column">
          <toggle-item
            v-model="permissions.board.create"
            label="Create"
            @update:model-value="handlePermissionChange('board', 'create')"
          />
          <toggle-item
            v-model="permissions.board.destroy"
            label="Delete"
            @update:model-value="handlePermissionChange('board', 'destroy')"
          />
          <toggle-item
            v-model="permissions.board.unassign"
            label="Unassign"
            @update:model-value="handlePermissionChange('board', 'unassign')"
          />
        </div>
      </div>
    </div>

    <div class="form-section">
      <p class="form-section-title">Roadmaps permissions</p>
      <div class="form-columns">
        <div class="form-column">
          <toggle-item
            v-model="permissions.roadmap.read"
            label="Read"
            @update:model-value="handlePermissionChange('roadmap', 'read')"
          />
          <toggle-item
            v-model="permissions.roadmap.update"
            label="Update"
            @update:model-value="handlePermissionChange('roadmap', 'update')"
          />
          <toggle-item
            v-model="permissions.roadmap.assign"
            label="Assign"
            @update:model-value="handlePermissionChange('roadmap', 'assign')"
          />
        </div>

        <div class="form-column">
          <toggle-item
            v-model="permissions.roadmap.create"
            label="Create"
            @update:model-value="handlePermissionChange('roadmap', 'create')"
          />
          <toggle-item
            v-model="permissions.roadmap.destroy"
            label="Delete"
            @update:model-value="handlePermissionChange('roadmap', 'destroy')"
          />
          <toggle-item
            v-model="permissions.roadmap.unassign"
            label="Unassign"
            @update:model-value="handlePermissionChange('roadmap', 'unassign')"
          />
        </div>
      </div>
    </div>

    <div class="form-section">
      <p class="form-section-title">Vote permissions</p>
      <div class="form-columns">
        <div class="form-column">
          <toggle-item
            v-model="permissions.vote.create"
            label="Create"
            @update:model-value="handlePermissionChange('vote', 'create')"
          />
          <toggle-item
            v-model="permissions.vote.destroy"
            label="Delete"
            @update:model-value="handlePermissionChange('vote', 'destroy')"
          />
        </div>

        <div class="form-column">
          <toggle-item
            v-model="permissions.vote.assign"
            label="Assign"
            @update:model-value="handlePermissionChange('vote', 'assign')"
          />
          <toggle-item
            v-model="permissions.vote.unassign"
            label="Unassign"
            @update:model-value="handlePermissionChange('vote', 'unassign')"
          />
        </div>
      </div>
    </div>

    <div class="form-section">
      <p class="form-section-title">Dashboard permissions</p>
      <div class="form-columns">
        <div class="form-column">
          <toggle-item
            v-model="permissions.dashboard.read"
            label="Read"
            @update:model-value="handlePermissionChange('dashboard', 'read')"
          />
        </div>
      </div>
    </div>

    <div class="form-section">
      <p class="form-section-title">Roles permissions</p>
      <div class="form-columns">
        <div class="form-column">
          <toggle-item
            v-model="permissions.role.read"
            label="Read"
            @update:model-value="handlePermissionChange('role', 'read')"
          />
          <toggle-item
            v-model="permissions.role.update"
            label="Update"
            @update:model-value="handlePermissionChange('role', 'update')"
          />
          <toggle-item
            v-model="permissions.role.assign"
            label="Assign"
            @update:model-value="handlePermissionChange('role', 'assign')"
          />
        </div>

        <div class="form-column">
          <toggle-item
            v-model="permissions.role.create"
            label="Create"
            @update:model-value="handlePermissionChange('role', 'create')"
          />
          <toggle-item
            v-model="permissions.role.destroy"
            label="Delete"
            @update:model-value="handlePermissionChange('role', 'destroy')"
          />
          <toggle-item
            v-model="permissions.role.unassign"
            label="Unassign"
            @update:model-value="handlePermissionChange('role', 'unassign')"
          />
        </div>
      </div>
    </div>

    <div class="form-section">
      <p class="form-section-title">Settings permissions</p>
      <div class="form-columns">
        <div class="form-column">
          <toggle-item
            v-model="permissions.settings.read"
            label="Read"
            @update:model-value="handlePermissionChange('settings', 'read')"
          />
        </div>

        <div class="form-column">
          <toggle-item
            v-model="permissions.settings.update"
            label="Update"
            @update:model-value="handlePermissionChange('settings', 'update')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import type { IRole, TPermission, IPermissionsState } from "@logchimp/types";
import { ShieldAlert } from "lucide-vue";

// modules
import { router } from "../../../router";
import { useUserStore } from "../../../store/user";
import { updateRole } from "../../../ee/modules/roles";
import { useDashboardRoles } from "../../../ee/store/dashboard/roles";

// components
import Button from "../../../components/ui/Button.vue";
import LText from "../../../components/ui/input/LText.vue";
import LTextarea from "../../../components/ui/input/LTextarea.vue";
import ToggleItem from "../../../components/ui/input/ToggleItem.vue";
import Breadcrumbs from "../../../components/Breadcrumbs.vue";
import BreadcrumbDivider from "../../../components/ui/breadcrumbs/BreadcrumbDivider.vue";
import BreadcrumbItem from "../../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import DashboardPageHeader from "../../../components/dashboard/PageHeader.vue";
import Alert from "../../../components/ui/Alert/Alert.vue";

const { permissions: userPermissions } = useUserStore();
const dashboardRoles = useDashboardRoles();

interface Props {
  title: string;
  role: IRole;
  permissions: IPermissionsState;
}
const props = defineProps<Props>();

const role = ref<IRole>(props.role);
const permissions = reactive<IPermissionsState>(props.permissions);
const updateRoleButtonLoading = ref(false);

const updateRoleButtonDisabled = computed(() => {
  const checkPermission = userPermissions.includes("role:update");
  return !checkPermission;
});

const permissionPrerequisite = {
  post: {
    create: ["read"],
    update: ["read"],
    destroy: ["read"],
  },
  board: {
    create: ["read"],
    update: ["read"],
    destroy: ["read"],
    assign: ["read"],
    unassign: ["read"],
  },
  roadmap: {
    create: ["read"],
    update: ["read"],
    destroy: ["read"],
    assign: ["read"],
    unassign: ["read"],
  },
  role: {
    create: ["read"],
    update: ["read"],
    destroy: ["read"],
    assign: ["read"],
    unassign: ["read"],
  },
  settings: {
    update: ["read"],
  },
};

const reversePrerequisites = {};
Object.keys(permissionPrerequisite).forEach((permission) => {
  reversePrerequisites[permission] = {};
  Object.keys(permissionPrerequisite[permission]).forEach((action) => {
    permissionPrerequisite[permission][action].forEach((required) => {
      if (!reversePrerequisites[permission][required]) {
        reversePrerequisites[permission][required] = [];
      }
      reversePrerequisites[permission][required].push(action);
    });
  });
});

const handlePermissionChange = (permission, action) => {
  const isEnabled = props.permissions[permission][action];

  if (isEnabled) {
    const prerequisites = permissionPrerequisite[permission]?.[action] || [];
    prerequisites.forEach((prerequisite) => {
      if (!props.permissions[permission][prerequisite]) {
        props.permissions[permission][prerequisite] = true;
      }
    });
  } else {
    const prerequisites = reversePrerequisites[permission]?.[action] || [];
    prerequisites.forEach((prerequisite) => {
      if (props.permissions[permission][prerequisite]) {
        props.permissions[permission][prerequisite] = false;
      }
    });
  }
};

async function updateRoleHandler() {
  updateRoleButtonLoading.value = true;

  const activePermissions: TPermission[] = [];
  for (const permissionType in permissions) {
    const typedPermissionType = permissionType as keyof typeof permissions;
    const permissionGroup = permissions[typedPermissionType];

    for (const action in permissionGroup) {
      const typedAction = action as keyof typeof permissionGroup;
      if (permissionGroup[typedAction]) {
        activePermissions.push(`${permissionType}:${action}` as TPermission);
      }
    }
  }

  try {
    const response = await updateRole({
      id: role.value.id,
      name: role.value.name,
      description: role.value.description,
      permissions: activePermissions,
    });

    if (response.status === 200) {
      dashboardRoles.updateRole(response.data.role);
      router.push("/dashboard/settings/roles");
    }
  } catch (err) {
    console.error(err);
  } finally {
    updateRoleButtonLoading.value = false;
  }
}

defineOptions({
  name: "DashboardRoleEditor",
});
</script>
