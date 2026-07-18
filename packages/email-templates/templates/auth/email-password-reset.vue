<script setup lang="ts">
import { preview } from "../../helpers/preview.ts";
import { defaultData } from "../../helpers/data";

const data = {
  ...defaultData,
  resetLink: "https://logchimp.app/reset-password",
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
      {{ preview('siteTitle', data.siteTitle) }} - Reset your account password
    </Preheader>

    <Container class="max-w-xl">
      <a :href="preview('url', data.url)">
        <Img :src="preview('siteLogo', data.siteLogo)" :alt="preview('siteTitle', data.siteTitle) + ' logo'" class="size-10" />
      </a>

      <Text>
        Hello,
      </Text>

      <Text>
        You can change your account password by clicking the "Reset password" button. This link will
        <strong>expire in 1 hour</strong>.
      </Text>

      <Text>
        <a
          :href="preview('resetLink', data.resetLink)"
          target="_blank"
          rel="noreferrer"
          class="text-white font-medium py-3 px-5 rounded-md text-sm no-underline inline-block"
          :style="{
            'background-color': preview('brandColor', data.brandColor),
          }"
        >
          Reset password
        </a>
      </Text>

      <Text class="text-sm text-neutral-600">
      Can't click the button above? Copy and paste this link into your browser:
      <a
        :href="preview('resetLink', data.resetLink)" target="_blank" rel="noreferrer"
        :style="{
          'color': preview('brandColor', data.brandColor),
        }"
      >
        {{ preview('resetLink', data.resetLink) }}
      </a>
    </Text>

      <Text>
        Thanks
      </Text>

      <Text>
        {{ preview('siteTitle', data.siteTitle) }}
        <br />
        <a
          :href="preview('url', data.url)"
          target="_blank"
          rel="noreferrer"
          :style="{
            'color': preview('brandColor', data.brandColor),
          }"
        >
          {{ preview('domain', data.domain) }}
        </a>
      </Text>
    </Container>
  </Layout>
</template>

