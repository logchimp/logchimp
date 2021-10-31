<template>
	<div class="sidebar">
		<header>
			<site-branding :settings="settings" :dashboard="true" />
		</header>
		<div class="sidebar-list">
			<h6>Manage</h6>
			<li>
				<a href="/dashboard" class="sidebar-list-item">
					<dashboard-icon />
					<p>Dashbaord</p>
				</a>
			</li>
			<li>
				<a href="/dashboard/boards" class="sidebar-list-item">
					<board-icon />
					<p>Boards</p>
				</a>
			</li>
			<li>
				<a href="/dashboard/roadmaps" class="sidebar-list-item">
					<roadmap-icon />
					<p>Roadmaps</p>
				</a>
			</li>
			<li>
				<a href="/dashboard/posts" class="sidebar-list-item">
					<post-icon />
					<p>Posts</p>
				</a>
			</li>
			<li>
				<a href="/dashboard/users" class="sidebar-list-item">
					<users-icon />
					<p>Users</p>
				</a>
			</li>
		</div>

		<div class="sidebar-list">
			<h6>Settings</h6>
			<li>
				<a href="/dashboard/settings/general" class="sidebar-list-item">
					<settings-icon />
					<p>General</p>
				</a>
			</li>
			<li>
				<a href="/dashboard/settings/roles" class="sidebar-list-item">
					<shield-icon />
					<p>Roles</p>
				</a>
			</li>
			<li>
				<a href="/dashboard/settings/labs" class="sidebar-list-item">
					<lab-icon />
					<p>Labs</p>
				</a>
			</li>
		</div>
		<footer>
			<dropdown-wrapper>
				<template #default="dropdown">
					<dropdown v-if="dropdown.active" class="dashboard-sidebar-dropdown">
						<dropdown-item @click="aboutLogChimp">
							<template #icon>
								<info-icon />
							</template>
							About LogChimp
						</dropdown-item>
						<dropdown-item @click="tweetLogChimp">
							<template #icon>
								<twitter-icon />
							</template>
							Tweet @LogChimp!
						</dropdown-item>
						<dropdown-spacer />
						<dropdown-item @click="signOut">
							<template #icon>
								<logout-icon />
							</template>
							Sign Out
						</dropdown-item>
					</dropdown>
				</template>
				<template #toggle>
					<div class="dashboard-sidebar-user-container">
						<div class="dashboard-sidebar-user">
							<avatar
								class="dashboard-sidebar-user-avatar"
								:src="user.avatar"
								:name="user.name || user.username"
							/>
							<div class="dashboard-sidebar-user-data">
								<div class="dashboard-sidebar-user-name">
									{{ user.name || user.username }}
								</div>
								<div class="dashboard-sidebar-user-email">
									{{ user.email }}
								</div>
							</div>
						</div>
					</div>
				</template>
			</dropdown-wrapper>
		</footer>
	</div>
</template>

<script>
// packages
import { mapGetters } from "vuex";
import {
	LayoutDashboard as DashboardIcon,
	Columns as BoardIcon,
	File as PostIcon,
	Users as UsersIcon,
	Settings as SettingsIcon,
	Shield as ShieldIcon,
	FlaskConical as LabIcon,
	Info as InfoIcon,
	Twitter as TwitterIcon,
	LogOut as LogoutIcon
} from "lucide-vue";

// components
import SiteBranding from "../site/SiteBranding.vue";
import Avatar from "../ui/Avatar.vue";
import DropdownWrapper from "../ui/dropdown/DropdownWrapper.vue";
import Dropdown from "../ui/dropdown/Dropdown.vue";
import DropdownItem from "../ui/dropdown/DropdownItem.vue";
import DropdownSpacer from "../ui/dropdown/DropdownSpacer.vue";

// icons
import RoadmapIcon from "../../components/icons/Roadmap.vue";

export default {
	name: "DashboardSidebar",
	components: {
		// components
		SiteBranding,
		Avatar,
		DropdownWrapper,
		Dropdown,
		DropdownItem,
		DropdownSpacer,

		// icons
		DashboardIcon,
		BoardIcon,
		RoadmapIcon,
		PostIcon,
		UsersIcon,
		SettingsIcon,
		LabIcon,
		InfoIcon,
		TwitterIcon,
		LogoutIcon,
		ShieldIcon
	},
	computed: {
		...mapGetters("settings", {
			settings: "get"
		}),
		user() {
			return this.$store.getters["user/getUser"];
		}
	},
	methods: {
		aboutLogChimp() {
			window.open("https://logchimp.codecarrot.net/");
		},
		tweetLogChimp() {
			window.open(
				"https://twitter.com/intent/tweet?text=%40LogChimp+Hi%21+Can+you+help+me+with+&related=LogChimp"
			);
		},
		signOut() {
			this.$store.dispatch("user/logout");

			// remove user from localStorage on client-side
			if (!process.server) {
				localStorage.removeItem("user");
			}
		}
	}
};
</script>

<style lang='sass'>
$white: #fff

.sidebar
	display: flex
	flex-direction: column
	position: sticky
	top: 0
	bottom: 0
	background-color: var(--color-brand-color)
	height: 100vh
	padding: 1rem
	min-width: 200px
	overflow-y: auto

	header
		margin-bottom: 1rem

	footer
		position: relative
		margin-top: auto

.sidebar-list
	margin-top: 2rem

	h6
		font-size: 0.75rem
		text-transform: uppercase
		color: var(--color-white)
		letter-spacing: 0.4px
		margin-bottom: 0.625rem

	li
		list-style: none

.sidebar-list-item
	display: flex
	align-items: center
	padding: 0.625rem 1rem

	svg
		stroke: var(--color-white)
		width: 1rem
		height: 1rem
		margin-right: 0.375rem

	p
		color: var(--color-white)

.sidebar-list-item.router-link-exact-active
	background-color: rgba($white, 0.1)
	border-radius: var(--border-radius-default)

	p
		font-weight: 600

.dashboard-sidebar-user-container
	cursor: pointer
	border-radius: var(--border-radius-default)
	padding: 0.625rem 1rem

	&:hover
		background-color: rgba($white, 0.1)

.dashboard-sidebar-user-container, .dashboard-sidebar-user
	display: flex
	align-items: center

.dashboard-sidebar-user-data
	user-select: none

.dashboard-sidebar-user-avatar
	margin-right: 0.625rem

.dashboard-sidebar-user-name
	font-weight: 600
	color: var(--color-white)

.dashboard-sidebar-user-email
	color: rgba($white, 0.5)
	font-size: 0.875rem

.dashboard-sidebar-dropdown
	top: -9rem
</style>
