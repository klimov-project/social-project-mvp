// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],
  future: {
    compatibilityVersion: 4,
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || '/api'
    }
  },
  // vite: {
  //   server: {
  //     proxy: {
  //       '/api': {
  //         target: 'http://localhost:4000',
  //         changeOrigin: true,
  //         secure: false,
  //       }
  //     }
  //   }
  // }
})
