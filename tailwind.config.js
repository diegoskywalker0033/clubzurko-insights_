/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: { colors: { 'brand-red': '#B11C1F', 'zurko-dark': '#505050', 'zurko-light': '#C6C6C6', 'zurko-black': '#000000' }, boxShadow: { 'card': '0 1px 3px 0 rgba(0,0,0,0.07)', 'card-hover': '0 4px 12px 0 rgba(0,0,0,0.1)' } } },
  plugins: []
}
