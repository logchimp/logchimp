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
      {{ preview('siteTitle', data.siteTitle) }} - Please verify your account
    </Preheader>

    <Container class="max-w-xl">
      <a :href="preview('url', data.url)">
        <Img :src="preview('siteLogo', data.siteLogo)" :alt="preview('siteTitle', data.siteTitle) + ' logo'" class="size-10" />
      </a>

      <Text>
        Hello,
      </Text>

      <Text>
        Thank you for creating an account.
      </Text>

      <Text>
        Please confirm your email address by clicking
        <strong>Confirm email</strong>
        button below:
      </Text>

      <Text>
        <a
          :href="preview('verificationLink', data.verificationLink)"
          target="_blank"
          rel="noreferrer"
          class="text-white font-medium py-3 px-5 rounded-md text-sm no-underline inline-block"
          :style="{
            'background-color': preview('brandColor', data.brandColor)
          }"
        >
          Confirm email
        </a>
      </Text>

      <Text class="text-sm text-neutral-600">
        Can't click the button above? Copy and paste this link into your browser:
        <a
          :href="preview('verificationLink', data.verificationLink)" target="_blank" rel="noreferrer"
          :style="{
            'color': preview('brandColor', data.brandColor)
          }"
        >
          {{ preview('verificationLink', data.verificationLink) }}
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
            'color': preview('brandColor', data.brandColor)
          }"
        >
          {{ preview('domain', data.domain) }}
        </a>
      </Text>
    </Container>
  </Layout>
</template>

