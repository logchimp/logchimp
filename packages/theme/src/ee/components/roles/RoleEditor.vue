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
          <div v-if="role.isSystem" class="ml-2" aria-hidden="true">
            <ComputerIcon class="size-5 text-neutral-400" />
          </div>
        </template>
      </Breadcrumbs>
    </template>

    <Button
      type="primary"
      :loading="updateRoleButtonLoading"
      :disabled="disableRoleEditorForm"
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

    <alert
      title="You cannot edit system generated role."
      type="warning"
    >
      <template #icon>
        <TriangleAlert />
      </template>
    </alert>

    <div class="form-section">
      <div class="form-columns">
        <div class="form-column">
          <l-text
            v-model="role.name"
            label="Name"
            placeholder="Role name"
            :disabled="disableRoleEditorForm"
          />
        </div>

        <div class="form-column">
          <l-textarea
            :model-value="role.description ?? undefined"
            @update:model-value="(value: string) => role.description = value ?? null"
            :disabled="disableRoleEditorForm"
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
<!--            :disabled="disableRoleEditorForm"-->
<!--            label="Read"-->
<!--            :disabled="true"-->
<!--          />-->
          <toggle-item
            v-model="permissions.post.update"
            :disabled="disableRoleEditorForm"
            label="Update"
            note="Authors can edit their own posts by default. This permission allows you to edit posts created by other users."
          />
        </div>

        <div class="form-column">
          <toggle-item
            v-model="permissions.post.create"
            :disabled="disableRoleEditorForm"
            label="Create"
            note="This permission allows you to create new posts."
          />
          <toggle-item
            v-model="permissions.post.destroy"
            :disabled="disableRoleEditorForm"
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
            :disabled="disableRoleEditorForm"
            label="Read"
            note="Anyone can view public boards by default. This permission allows you to view private boards."
          />
          <toggle-item
            v-model="permissions.board.update"
            :disabled="disableRoleEditorForm"
            label="Update"
            note="This permission allows you to update board details."
          />
          <toggle-item
            v-model="permissions.board.assign"
            :disabled="disableRoleEditorForm"
            label="Assign"
            note="This permission allows you to assign posts to boards."
          />
        </div>

        <div class="form-column">
          <toggle-item
            v-model="permissions.board.create"
            :disabled="disableRoleEditorForm"
            label="Create"
            note="This permission allows you to create new boards."
          />
          <toggle-item
            v-model="permissions.board.destroy"
            :disabled="disableRoleEditorForm"
            label="Delete"
            note="This permission allows you to delete board."
          />
          <toggle-item
            v-model="permissions.board.unassign"
            :disabled="disableRoleEditorForm"
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
            :disabled="disableRoleEditorForm"
            label="Read"
            note="Anyone can view public boards by default. This permission allows you to view private roadmaps."
          />
          <toggle-item
            v-model="permissions.roadmap.update"
            :disabled="disableRoleEditorForm"
            label="Update"
            note="This permission allows you to update roadmap details."
          />
          <toggle-item
            v-model="permissions.roadmap.assign"
            :disabled="disableRoleEditorForm"
            label="Assign"
            note="This permission allows you to assign posts to roadmaps."
          />
        </div>

        <div class="form-column">
          <toggle-item
            v-model="permissions.roadmap.create"
            :disabled="disableRoleEditorForm"
            label="Create"
            note="This permission allows you to create new roadmaps."
          />
          <toggle-item
            v-model="permissions.roadmap.destroy"
            :disabled="disableRoleEditorForm"
            label="Delete"
            note="This permission allows you to delete roadmap."
          />
          <toggle-item
            v-model="permissions.roadmap.unassign"
            :disabled="disableRoleEditorForm"
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
            :disabled="disableRoleEditorForm"
            label="Create"
            note="This permission allows you to upvote on a post."
          />
          <toggle-item
            v-model="permissions.vote.destroy"
            :disabled="disableRoleEditorForm"
            label="Delete"
            note="This permission allows you to downvote on a post."
          />
        </div>

        <div class="form-column">
          <toggle-item
            v-model="permissions.vote.assign"
            :disabled="disableRoleEditorForm"
            label="Assign"
            note="This permission allows you to upvote as another user."
          />
          <toggle-item
            v-model="permissions.vote.unassign"
            :disabled="disableRoleEditorForm"
            label="Unassign"
            note="This permission allows you to downvote as another user."
          />
        </div>
      </div>
    </div>

    <div class="form-section">
      <p class="form-section-title">Comment permissions</p>
      <div class="grid grid-cols-2 gap-x-8">
        <div class="flex flex-col gap-y-4 w-full">
          <toggle-item
            v-model="permissions.comment.create"
            :disabled="disableRoleEditorForm"
            label="Create"
            note="This permission allows you to create comments on posts."
          />
          <role-modify-permission-scope
            v-model="permissions.comment.update"
            :disabled="disableRoleEditorForm"
            label="Update"
            note="This permission allows you to update comments."
          />
          <toggle-item
            v-model="permissions.comment.view_internal"
            :disabled="disableRoleEditorForm"
            label="View internal"
            note="This permission allows you to view internal comments on posts."
          />
        </div>

        <div class="flex flex-col gap-y-4 w-full">
          <toggle-item
            v-model="permissions.comment.create_internal"
            :disabled="disableRoleEditorForm"
            label="Create internal"
            note="This permission allows you to create internal comments on posts."
          />
          <role-modify-permission-scope
            v-model="permissions.comment.delete"
            :disabled="disableRoleEditorForm"
            label="Delete"
            note="This permission allows you to delete comments."
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
            :disabled="disableRoleEditorForm"
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
            :disabled="disableRoleEditorForm"
            label="Read"
            note="This permission allows you to read roles."
          />
          <toggle-item
            v-model="permissions.role.update"
            :disabled="disableRoleEditorForm"
            label="Update"
            note="This permission allows you to update role details and its permissions."
          />
          <toggle-item
            v-model="permissions.role.assign"
            :disabled="disableRoleEditorForm"
            label="Assign"
            note="This permission allows you to assign roles to users."
          />
        </div>

        <div class="form-column">
          <toggle-item
            v-model="permissions.role.create"
            :disabled="disableRoleEditorForm"
            label="Create"
            note="This permission allows you to create new roles."
          />
          <toggle-item
            v-model="permissions.role.destroy"
            :disabled="disableRoleEditorForm"
            label="Delete"
            note="This permission allows you to delete roles."
          />
          <toggle-item
            v-model="permissions.role.unassign"
            :disabled="disableRoleEditorForm"
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
<!--            :disabled="disableRoleEditorForm"-->
<!--            label="Read"-->
<!--            note="This permission allows you to read LogChimp settings."-->
<!--            :disabled="true"-->
<!--          />-->
          <toggle-item
            v-model="permissions.settings.update"
            :disabled="disableRoleEditorForm"
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
import { ShieldAlert, ComputerIcon, TriangleAlert } from "lucide-vue";

// modules
import { router } from "../../../router";
import { useUserStore } from "../../../store/user";
import { updateRole } from "../../modules/roles";
import { useDashboardRoles } from "../../store/dashboard/roles";

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
import RoleModifyPermissionScope from "./ModifyPermissionScope.vue";

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

const disableRoleEditorForm = computed(() => {
  if (role.value.isSystem) return true;
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
      if (
        typeof permissionGroup[typedAction] === "boolean" &&
        permissionGroup[typedAction] === true
      ) {
        activePermissions.push(`${permissionType}:${action}` as TPermission);
      } else if (
        typeof permissionGroup[typedAction] === "string" &&
        permissionGroup[typedAction] !== "none" &&
        permissionGroup[typedAction] !== ""
      ) {
        activePermissions.push(
          `${permissionType}:${action}:${permissionGroup[typedAction]}` as TPermission,
        );
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
