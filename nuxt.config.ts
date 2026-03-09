// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: "src/",
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@vee-validate/nuxt"],
  css: ["~/assets/css/main.css"],
  app: {
    head: {
      htmlAttrs: { lang: "pt" },
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      title: "Calculadora de Mais-Valias Imobiliárias",
      link: [
        { rel: "canonical", href: "https://maisvalias.andremonteiro.pt" },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
        { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
        { rel: "manifest", href: "/site.webmanifest" },
      ],
      meta: [
        {
          name: "description",
          content:
            "Calcule as mais-valias na venda do seu imóvel em Portugal. Considera coeficientes de desvalorização, despesas dedutíveis e reinvestimento (IRS 2025).",
        },
        // Open Graph
        { property: "og:type", content: "website" },
        {
          property: "og:title",
          content: "Calculadora de Mais-Valias Imobiliárias",
        },
        {
          property: "og:description",
          content:
            "Calcule as mais-valias na venda do seu imóvel em Portugal. Considera coeficientes de desvalorização, despesas dedutíveis e reinvestimento (IRS 2025).",
        },
        { property: "og:locale", content: "pt_PT" },
        { property: "og:url", content: "https://maisvalias.andremonteiro.pt" },
        {
          property: "og:image",
          content: "https://maisvalias.andremonteiro.pt/og-image.png",
        },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        // Twitter / X
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:title",
          content: "Calculadora de Mais-Valias Imobiliárias",
        },
        {
          name: "twitter:description",
          content:
            "Calcule as mais-valias na venda do seu imóvel em Portugal. Considera coeficientes de desvalorização, despesas dedutíveis e reinvestimento (IRS 2025).",
        },
        {
          name: "twitter:image",
          content: "https://maisvalias.andremonteiro.pt/og-image.png",
        },
        // Misc
        { name: "robots", content: "index, follow" },
      ],
    },
  },
  vite: {
    define: {
      __BUILD_DATE__: JSON.stringify(new Date().toLocaleDateString("pt-PT", { month: "long", year: "numeric" })),
    },
  },
  nitro: {
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
    },
  },
});
