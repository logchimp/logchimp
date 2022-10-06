<template>
  <div>
    <header class="form-header">
      <div class="breadcrumbs">
        <h5 class="breadcrum-item">
          Users
        </h5>
      </div>
    </header>

    <Table class="users-table">
      <template #header>
        <div class="table-header-item users-table-user">
          name
        </div>
        <div class="table-header-item users-table-posts">
          posts
        </div>
        <div class="table-header-item users-table-votes">
          votes
        </div>
        <div v-if="settings.developer_mode" class="table-header-item users-table-votes" />
      </template>
			<div v-infinite-scroll="getUsers">
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
									class="table-data table-data-icon boards-table-icon-settings dropdown-menu-icon"
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
        <!-- <div slot="spinner" class="loader-container">
          <loader />
        </div>
        <div slot="no-more" />
        <div slot="no-results" />
        <div slot="error" /> -->
      </div>
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
import { vInfiniteScroll } from "@vueuse/components";
import {
  Clipboard as CopyIcon,
  MoreHorizontal as MoreIcon
} from "lucide-vue";

// modules
import { useSettingStore } from "../../store/settings";
import { getAllUsers } from "../../modules/users";
import { useCopyText } from "../../hooks";

// components
import Table from "../../components/Table.vue";
import Avatar from "../../components/Avatar";
// import Loader from "../../components/Loader.vue";
import DropdownWrapper from "../../components/dropdown/DropdownWrapper.vue";
import Dropdown from "../../components/dropdown/Dropdown.vue";
import DropdownItem from "../../components/dropdown/DropdownItem.vue";

const { settings } = useSettingStore()

// TODO: Add TS types
const users = ref<any>([])
const page = ref(1)

async function getUsers() {
	try {
		const response = await getAllUsers({
			page: page.value,
			sort: "DESC",
		});

		if (response.data.users.length) {
			users.value.push(...response.data.users);
			page.value += 1;
			// $state.loaded();
		} else {
			// $state.complete();
		}
	} catch (error: any) {
		// $state.error();
		console.error(error);
	}
}

onMounted(() => getUsers())

useHead({
	title: "Users · Dashboard"
})
</script>
