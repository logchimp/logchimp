<template>
  <DashboardPageHeader>
    <template v-slot:left>
      <Breadcrumbs>
        <BreadcrumbItem>Users</BreadcrumbItem>
      </Breadcrumbs>
    </template>
  </DashboardPageHeader>

  <div class="px-3 lg:px-6">
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
        <DashboardUsersTabularItem :user="user" :settings="settings" />
      </div>

      <infinite-scroll @infinite="getUsers" :state="state" />
    </Table>
  </div>
</template>

<script lang="ts">
export default {
  name: "DashboardUsers",
};
</script>

<script setup lang="ts">
// packages
import { ref } from "vue";
import { useHead } from "@vueuse/head";

// modules
import { useSettingStore } from "../../store/settings";
import { getAllUsers } from "../../modules/users";

// components
import InfiniteScroll, { type InfiniteScrollStateType } from "../../components/ui/InfiniteScroll.vue";
import Table from "../../components/ui/Table.vue";
import Breadcrumbs from "../../components/Breadcrumbs.vue";
import DashboardPageHeader from "../../components/dashboard/PageHeader.vue";
import BreadcrumbItem from "../../components/ui/breadcrumbs/BreadcrumbItem.vue";
import DashboardUsersTabularItem from "../../ee/components/dashboard/users/TabularItem.vue";

const { settings } = useSettingStore()

// TODO: Add TS types
const users = ref<unknown>([])
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
