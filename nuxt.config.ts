// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  srcDir: '.',

  modules: [
    '@nuxtjs/tailwindcss'
  ],

  css: [
    '~/assets/css/main.css'
  ],

  runtimeConfig: {
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    public: {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
      openMeteoBaseUrl: process.env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com/v1',
      nasaPowerBaseUrl: process.env.NASA_POWER_BASE_URL || 'https://power.larc.nasa.gov/api/temporal/daily/point'
    }
  },

  app: {
    head: {
      title: 'TANIAMAN — Climate-Agricultural Decision Support System',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Simulasikan Sebelum Menanam. Platform Decision Support System (DSS) pertanian adaptif iklim terpadu.'
        }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap'
        }
      ]
    }
  }
})
