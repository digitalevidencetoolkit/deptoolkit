import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess(),

  kit: {
    target: '#svelte',
    adapter: adapter({
      pages: 'out/',
      assets: 'out/',
    }),
    vite: () => ({
      clearScreen: false,
      server: {
        proxy: {
          '/api': {
            target: 'http://localhost:3000',
            rewrite: path => path.replace(/^\/api/, ''),
          },
        },
      },
    }),
  },
};

export default config;
