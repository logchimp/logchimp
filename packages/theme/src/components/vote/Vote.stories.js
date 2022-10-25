import Vuex from "vuex";

import Vote from "./Vote";

const store = new Vuex.Store({
  state: {
    user: {
      // random UUID
      userId: "d33e4e05-9c8b-4255-9838-b59085d081a0",
    },
    permissions: ["vote:create", "vote:destroy"],
  },
  getters: {
    "user/getUserId": (state) => state.user.userId,
    "user/getPermissions": (state) => state.permissions,
  },
  mutations: {
    updateUser(state, payload) {
      state.user = payload;
    },
    updatePermissions(state, payload) {
      state.permissions = payload;
    },
  },
});

export default {
  title: "Vote",
  component: Vote,
};

const Template = (_, { argTypes }) => ({
  components: { Vote },
  props: Object.keys(argTypes),
  store,
  template: '<vote v-bind="$props" />',
});

export const Default = Template.bind({});
Default.args = {
  postId: "8b1a0315-c941-45d5-a9c9-92e9497599bb",
  votesCount: 0,
  isVoted: false,
};

export const VoteWithCounts = Template.bind({});
VoteWithCounts.args = {
  postId: "8b1a0315-c941-45d5-a9c9-92e9497599bb",
  votesCount: 2,
  isVoted: false,
};

export const Voted = Template.bind({});
Voted.args = {
  postId: "8b1a0315-c941-45d5-a9c9-92e9497599bb",
  votesCount: 2,
  isVoted: true,
};
