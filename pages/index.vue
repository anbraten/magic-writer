<template>
  <div class="w-full p-4">
    <Editor v-model="text" />
  </div>
</template>

<script lang="ts" setup>
import { useStorage } from '@vueuse/core';

const defaultText = `
<h2>🧙🏽‍♂️ writer</h2>
<p>Writing your text with some magic can be pretty handy. Grab your wand also known as an OpenAI token with some credits and let me help you to make your life feather light: \`Wingardium Leviosa\` 🪄
</p>
<p>
  PS: Be aware of the dark side of the magic, it can be dangerous if you don't know how to use it properly. Alway remember to check the ingredients of this spell and avoid copy-pasting it without understanding the consequences. 🪦 🧙🏽‍
</p>
<h2>Deployment</h2>
<p>Deployed on Cloudflare: <a href="https://magic-writer.pages.dev">magic-writer.pages.dev</a></p>
<h2>Development</h2>
<p>Start the development server on <code>http://localhost:3000</code>:</p>
<pre><code># install dependencies
bun i

# start the development server
bun run dev
</code></pre>
`.trim();

const text = useStorage('magic-writer:text:default', defaultText);
</script>
