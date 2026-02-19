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
<!--          <toggle-item-->
<!--            v-model="permissions.post.read"-->
<!--            label="Read"-->
<!--            :disabled="true"-->
<!--          />-->
          <toggle-item
            v-model="permissions.post.update"
            label="Update"
            note="Authors can edit their own posts by default. This permission allows you to edit posts created by other users."
          />
        </div>

        <div class="form-column">
          <toggle-item
            v-model="permissions.post.create"
            label="Create"
            note="This permission allows you to create new posts."
          />
          <toggle-item
            v-model="permissions.post.destroy"
            label="Delete"
            note="Users cannot delete posts by default. This permission allows you to delete posts."
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
            note="Anyone can view public boards by default. This permission allows you to view private boards."
          />
          <toggle-item
            v-model="permissions.board.update"
            label="Update"
            note="This permission allows you to update board details."
          />
          <toggle-item
            v-model="permissions.board.assign"
            label="Assign"
            note="This permission allows you to assign posts to boards."
          />
        </div>

        <div class="form-column">
          <toggle-item
            v-model="permissions.board.create"
            label="Create"
            note="This permission allows you to create new boards."
          />
          <toggle-item
            v-model="permissions.board.destroy"
            label="Delete"
            note="This permission allows you to delete board."
          />
          <toggle-item
            v-model="permissions.board.unassign"
            label="Unassign"
            note="This permission allows you to unassign posts from boards."
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
            note="Anyone can view public boards by default. This permission allows you to view private roadmaps."
          />
          <toggle-item
            v-model="permissions.roadmap.update"
            label="Update"
            note="This permission allows you to update roadmap details."
          />
          <toggle-item
            v-model="permissions.roadmap.assign"
            label="Assign"
            note="This permission allows you to assign posts to roadmaps."
          />
        </div>

        <div class="form-column">
          <toggle-item
            v-model="permissions.roadmap.create"
            label="Create"
            note="This permission allows you to create new roadmaps."
          />
          <toggle-item
            v-model="permissions.roadmap.destroy"
            label="Delete"
            note="This permission allows you to delete roadmap."
          />
          <toggle-item
            v-model="permissions.roadmap.unassign"
            label="Unassign"
            note="This permission allows you to unassign posts from roadmaps."
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
            note="This permission allows you to upvote on a post."
          />
          <toggle-item
            v-model="permissions.vote.destroy"
            label="Delete"
            note="This permission allows you to downvote on a post."
          />
        </div>

        <div class="form-column">
          <toggle-item
            v-model="permissions.vote.assign"
            label="Assign"
            note="This permission allows you to upvote as another user."
          />
          <toggle-item
            v-model="permissions.vote.unassign"
            label="Unassign"
            note="This permission allows you to downvote as another user."
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
            note="This permission allows you to view LogChimp dashboard."
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
            note="This permission allows you to read roles."
          />
          <toggle-item
            v-model="permissions.role.update"
            label="Update"
            note="This permission allows you to update role details and its permissions."
          />
          <toggle-item
            v-model="permissions.role.assign"
            label="Assign"
            note="This permission allows you to assign roles to users."
          />
        </div>

        <div class="form-column">
          <toggle-item
            v-model="permissions.role.create"
            label="Create"
            note="This permission allows you to create new roles."
          />
          <toggle-item
            v-model="permissions.role.destroy"
            label="Delete"
            note="This permission allows you to delete roles."
          />
          <toggle-item
            v-model="permissions.role.unassign"
            label="Unassign"
            note="This permission allows you to unassign roles from users."
          />
        </div>
      </div>
    </div>

    <div class="form-section">
      <p class="form-section-title">Settings permissions</p>
      <div class="form-columns">
        <div class="form-column">
<!--          <toggle-item-->
<!--            v-model="permissions.settings.read"-->
<!--            label="Read"-->
<!--            note="This permission allows you to read LogChimp settings."-->
<!--            :disabled="true"-->
<!--          />-->
          <toggle-item
            v-model="permissions.settings.update"
            label="Update"
            note="This permission allows you to update LogChimp settings."
          />
        </div>

        <div class="form-column">
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
