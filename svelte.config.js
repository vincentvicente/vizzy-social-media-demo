import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		// Node runtime on Vercel — we need node:crypto for cookie session AES-GCM.
		// Edge runtime exposes Web Crypto only and would require a separate impl.
		adapter: adapter({ runtime: 'nodejs20.x' })
	}
};

export default config;
