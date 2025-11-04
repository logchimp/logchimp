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
        <div v-if="isDeveloperMode" class="table-header-item users-table-votes" />
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
        <div v-if="isDeveloperMode" class="table-icon-group boards-table-icons">
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
                  @click="copyText(user.userId)"
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
      <infinite-loading @infinite="getUsers">
        <div slot="spinner" class="loader-container">
          <loader />
        </div>
        <div slot="no-more" />
        <div slot="no-results" />
        <div slot="error" />
      </infinite-loading>
    </Table>
  </div>
</template>

<script>
// packages
import {
  Clipboard as CopyIcon,
  MoreHorizontal as MoreIcon
} from "lucide-vue";
import InfiniteLoading from "vue-infinite-loading";

// modules
import { getAllUsers } from "../../modules/users";

// components
import Table from "../../components/Table";
import Avatar from "../../components/Avatar";
import Loader from "../../components/Loader";
import DropdownWrapper from "../../components/dropdown/DropdownWrapper";
import Dropdown from "../../components/dropdown/Dropdown";
import DropdownItem from "../../components/dropdown/DropdownItem";

export default {
  name: "DashboardUsers",
  components: {
    // package
    InfiniteLoading,

    // component
    Table,
    Avatar,
    Loader,
    DropdownWrapper,
    Dropdown,
    DropdownItem,

    // icons
    CopyIcon,
    MoreIcon
  },
  data() {
    return {
      users: [],
      page: 1
    };
  },
  computed: {
    isDeveloperMode() {
      return this.$store.getters["settings/get"].developer_mode;
    }
  },
  methods: {
    async getUsers($state) {
      try {
        const response = await getAllUsers(this.page, "desc");

        if (response.data.users.length) {
          this.users.push(...response.data.users);
          this.page += 1;
          $state.loaded();
        } else {
          $state.complete();
        }
      } catch (error) {
        $state.error();
        console.error(error);
      }
    },
    copyText(text) {
      navigator.clipboard.writeText(text).then().catch(err => console.log(err));
    }
  },
  metaInfo() {
    return {
      title: "Users · Dashboard"
    };
  }
};
</script>
