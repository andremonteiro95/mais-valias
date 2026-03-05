// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: "src/",
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@vee-validate/nuxt"],
  css: ["~/assets/css/main.css"],
  nitro: {
    preset: "static",
  },
});
