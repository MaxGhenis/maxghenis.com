import { getViteConfig } from 'astro/config';

export default getViteConfig({
	test: {
		include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
		environment: 'happy-dom',
	},
});
