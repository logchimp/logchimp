<template>
  <div>
    <header class="form-header">
      <breadcrumbs>
        <h5 class="breadcrum-item">Users</h5>
      </breadcrumbs>
    </header>

    <Table class="users-table">
      <template #header>
        <div class="table-header-item users-table-user">name</div>
        <div class="table-header-item users-table-posts">posts</div>
        <div class="table-header-item users-table-votes">votes</div>
        <div
          v-if="settings.developer_mode"
          class="table-header-item users-table-votes"
        />
      </template>

      <div
        v-for="user in users"
        :key="user.userId"
        class="table-row"
      >
        <div class="table-data users-table-user">
          <div class="users-table-user-avatar">
            <avatar :src="user.avatar" :name="user.name || user.username" />
          </div>
          <h6 class="users-table-user-name">
            {{ user.name || user.username }}
          </h6>
        </div>
        <div class="table-data users-table-posts">
          {{ user.posts }}
        </div>
        <div class="table-data users-table-votes">
          {{ user.votes }}
        </div>
        <div v-if="settings.developer_mode" class="table-icon-group boards-table-icons">
          <dropdown-wrapper>
            <template #toggle>
              <div
                class="
                  table-data table-data-icon
                  boards-table-icon-settings
                  dropdown-menu-icon
                "
              >
                <more-icon />
              </div>
            </template>
            <template #default="dropdown">
              <dropdown v-if="dropdown.active" class="sw">
                <dropdown-item
                  @click="useCopyText(user.userId)"
                >
                  <template #icon>
                    <copy-icon />
                  </template>
                  Copy ID
                </dropdown-item>
              </dropdown>
            </template>
          </dropdown-wrapper>
        </div>
      </div>

      <infinite-scroll @infinite="getUsers" :state="state" />
    </Table>
  </div>
</template>

<script lang="ts">
export default {
	name: "DashboardUsers"
}
</script>

<script setup lang="ts">
// packages
import { onMounted, ref } from "vue";
import { useHead } from "@vueuse/head";
import {
  Clipboard as CopyIcon,
  MoreHorizontal as MoreIcon
} from "lucide-vue";

// modules
import { useSettingStore } from "../../store/settings";
import { getAllUsers } from "../../modules/users";
import { useCopyText } from "../../hooks";

// components
import InfiniteScroll, { InfiniteScrollStateType } from "../../components/ui/InfiniteScroll.vue";
import Table from "../../components/ui/Table.vue";
import { Avatar } from "../../components/ui/Avatar";
import DropdownWrapper from "../../components/ui/dropdown/DropdownWrapper.vue";
import Dropdown from "../../components/ui/dropdown/Dropdown.vue";
import DropdownItem from "../../components/ui/dropdown/DropdownItem.vue";
import Breadcrumbs from "../../components/Breadcrumbs.vue";

const { settings } = useSettingStore()

// TODO: Add TS types
const users = ref<any>([])
const page = ref<number>(1)
const state = ref<InfiniteScrollStateType>()

async function getUsers() {
  state.value = "LOADING"

	try {
		const response = await getAllUsers({
			page: page.value,
			sort: "DESC",
		});

		if (response.data.users.length) {
			users.value.push(...response.data.users);
			page.value += 1;
			state.value = "LOADED"
		} else {
			state.value = "COMPLETED"
		}
	} catch (error: any) {
		console.error(error);
		state.value = "ERROR"
	}
}

useHead({
	title: "Users • Dashboard"
})
</script>

<style lang='sass'>
.users-table
  .users-table-user
    display: flex
    align-items: center
    flex: 6

    .users-table-user-avatar
      margin-right: 0.5rem

    .users-table-user-name
      margin-bottom: 0

  .users-table-posts
    flex: 1

  .users-table-votes
    flex: 1
</style>
