<script setup lang="ts">
import { preview } from "../../helpers/preview.ts";
import { defaultData } from "../../helpers/data";

const data = {
  ...defaultData,
  postUrl: `${defaultData.url}/posts/add-dark-mode`,
  postTitle: "Add dark mode",
  postDescription: "Add dark mode to the website",
  roadmapTitle: "Completed",
  roadmapColor: "#abcdef",
};
</script>

<template>
  <Layout class="p-4 bg-white">
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
      media="screen"
    >
    <Preheader>
      Your post has an update - {{ preview('siteTitle', data.siteTitle) }}
    </Preheader>

    <Container class="max-w-xl">
      <a :href="preview('url', data.url)" class="flex items-center">
        <Img
          :src="preview('siteLogo', data.siteLogo)"
          :alt="preview('siteTitle', data.siteTitle) + ' logo'"
          class="size-10"
          position="center"
        />
      </a>

      <Text>
        An update on a post you upvoted: <a
          class="font-bold underline decoration-dotted text-black"
          :href="preview('postUrl', data.postUrl)"
        >
          {{ preview('postTitle', data.postTitle)}}
        </a>,
        has been moved to <span
          class="font-bold"
          :style="{
            color: `#${preview('roadmapColor', data.roadmapColor)}`
          }"
        >
          {{ preview('roadmapTitle', data.roadmapTitle) }}
        </span>.
      </Text>

      <Section class="bg-neutral-50 px-5 py-1 rounded-xl">
        <Text class="text-sm font-bold underline decoration-dotted">
          <a :href="preview('postUrl', data.postUrl)" class="text-black">
            {{ preview('postTitle', data.postTitle)}}
          </a>
        </Text>

        <Text class="text-neutral-600 text-xs">
          {{ preview('postDescription', data.postDescription) }}
        </Text>
      </Section>

      <Hr class="bg-neutral-300" />

      <Section>
        <Text class="text-xs/4.5 text-gray-400">
          This email was intended for {{ preview('recipientEmail', data.recipientEmail)}}.
        </Text>

        <Text class="mb-0 text-xs/4.5 text-gray-400">
          Copyright &copy; {{ preview('fullYear', data.fullYear) }} {{ preview('siteTitle', data.siteTitle) }}. All rights reserved.
        </Text>
      </Section>
    </Container>
  </Layout>
</template>

