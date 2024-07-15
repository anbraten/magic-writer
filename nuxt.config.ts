// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  runtimeConfig: {
    openai: {
      token: '',
    },
  },
  app: {
    head: {
      title: '🧙🏽‍♂️ writer',
    },
  },
});
