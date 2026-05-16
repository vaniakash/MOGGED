import type { Config } from 'tailwindcss'

// Tailwind v4: most config moves to @theme in CSS.
// This file is kept minimal - just content paths.
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
}

export default config
