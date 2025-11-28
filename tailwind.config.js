/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,jsx,ts,tsx}'
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f7ff',
                    100: '#dceefe',
                    200: '#b7ddfd',
                    300: '#84c7fb',
                    400: '#4cabf7',
                    500: '#1d8ff2',
                    600: '#0b72d6',
                    700: '#0659a9',
                    800: '#064c8c',
                    900: '#083f73'
                }
            },
            fontFamily: {
                sans: ['system-ui', 'Segoe UI', 'Roboto', 'Inter', 'sans-serif']
            }
        }
    },
    plugins: []
};
