import Avatar from ".";

export default {
  title: "UI/Avatar",
  component: Avatar,
};

const Template = (args, { argTypes }) => ({
  components: { Avatar },
  props: Object.keys(argTypes),
  template: '<avatar v-bind="$props" />',
});

export const Name = Template.bind({});
Name.args = {
  name: "Name",
};

export const Image = Template.bind({});
Image.args = {
  name: "Name",
  src: "https://www.gravatar.com/avatar/55502f40dc8b7c769880b10874abc9d0",
};
