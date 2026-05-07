import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
    './src/views/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primarios INDRA
        petroleum:   '#004254',
        'deep-navy': '#002532',
        'warm-gray': '#AAAA9F',
        'dark-gray': '#646459',
        // Acentos INDRA
        accent: {
          green:  '#44B757',
          purple: '#8661F5',
          orange: '#E56813',
        },
        // Neutros INDRA
        neutral: {
          warm:  '#E3E2DA',
          light: '#BCBBB5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 1px 4px 0 rgba(0,0,0,0.08)',
        'card-hover': '0 4px 16px 0 rgba(0,36,50,0.12)',
      },
    },
  },
  plugins: [],
}

export default config
