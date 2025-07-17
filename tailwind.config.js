// tailwind.config.js

export const content = ['./src/**/*.{js,jsx}'];

export const theme = {
  extend: {
    animation: {
      'fade-in': 'fadeIn 0.3s ease-out',
      'scale-in': 'scaleIn 0.3s ease-out',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      scaleIn: {
        '0%': { opacity: '0', transform: 'scale(0.95)' },
        '100%': { opacity: '1', transform: 'scale(1)' },
      },
    },
  },
};

export const plugins = [];
