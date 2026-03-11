import ActivityItem from "./ActivityItem.vue";

export default {
  title: "UI/Activity Item",
  component: ActivityItem,
};

//👇 We create a “template” of how args map to rendering
const Template = (_, { argTypes }) => ({
  components: { ActivityItem },
  props: Object.keys(argTypes),
  template: '<activity-item v-bind="$props" />',
});

export const Default = Template.bind({});
Default.args = {
  activity: {
    id: "86c4d223-972a-448a-abbe-458eb87fc0c6",
    type: "comment",
    comment: {
      id: "c5e4bddd-6615-4f7a-ae0e-3402ce958df9",
      parent_id: null,
      body: "sda",
      is_internal: false,
      is_edited: false,
      is_spam: false,
      created_at: "2021-06-26T06:10:24.536+00:00",
      updated_at: "2021-06-26T06:10:24.536+00:00",
    },
    author: {
      user_id: "5713d443-98b0-4a07-8908-385c4e6afca5",
      name: "Yashu Mittal",
      username: "mittalyashu",
      avatar:
        "https://www.gravatar.com/avatar/a32d5e3c2f125c7dfc92467707d73f3c",
    },
    created_at: "2021-06-26T06:10:24.537Z",
  },
};

export const Edited = Template.bind({});
Edited.args = {
  activity: {
    id: "86c4d223-972a-448a-abbe-458eb87fc0c7",
    type: "comment",
    comment: {
      id: "c5e4bddd-6615-4f7a-ae0e-3402ce958df0",
      parent_id: null,
      body: "This comment has been edited.",
      is_internal: false,
      is_edited: true,
      is_spam: false,
      created_at: "2021-06-26T06:10:24.536+00:00",
      updated_at: "2021-06-26T07:30:00.000+00:00",
    },
    author: {
      user_id: "5713d443-98b0-4a07-8908-385c4e6afca5",
      name: "Yashu Mittal",
      username: "mittalyashu",
      avatar:
        "https://www.gravatar.com/avatar/a32d5e3c2f125c7dfc92467707d73f3c",
    },
    created_at: "2021-06-26T06:10:24.537Z",
  },
};
