import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

/**
 * IG OAuth requires HTTPS callbacks, which means local dev is reached through
 * a tunnel (ngrok / Vercel deploy URL). Vite blocks requests whose Host header
 * doesn't match an allowed entry — so we whitelist the ngrok subdomains used
 * by this demo. Add more entries here if you provision additional tunnels.
 */
export default defineConfig({
	plugins: [sveltekit()],
	server: {
		allowedHosts: [
			'repeal-expansion-bulldozer.ngrok-free.dev',
			'.ngrok-free.dev',
			'.vercel.app'
		]
	}
});
