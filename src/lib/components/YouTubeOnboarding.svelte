<script lang="ts">
	import { env } from '$env/dynamic/public';

	let { open = false }: { open?: boolean } = $props();

	// Exact Google Cloud OAuth consent screen / Test users URL, configured per-deployment
	// (PUBLIC_YOUTUBE_TESTERS_URL). Clicking it lands the user at Google's login → then
	// the OAuth consent screen audience page once authed.
	const consoleUrl = env.PUBLIC_YOUTUBE_TESTERS_URL || 'https://console.cloud.google.com/';
</script>

<details class="guide" {open}>
	<summary>Need access? Add your Google account as a Test user</summary>
	<p class="why">
		The app is in Google OAuth <strong>Testing</strong> mode — only Google accounts on the
		<em>Test users</em> list can connect (max 100). Without this, Google returns 403 access_denied.
	</p>

	<a class="primary-link" href={consoleUrl} target="_blank" rel="noopener">
		Open Google Cloud Test users ↗
	</a>

	<ol class="steps">
		<li>Click the button — Google will prompt you to log in, then land you on the OAuth consent screen.</li>
		<li>
			Find the <strong>Test users</strong> section → click <strong>+ Add users</strong> → enter your
			full Gmail address (e.g. <code>you@gmail.com</code>) → Save.
		</li>
		<li>Come back here and click <strong>Connect YouTube</strong>.</li>
		<li>
			Google will show <em>"This app isn't verified"</em> — that's normal for an unverified
			internal demo. Click <strong>Advanced → Continue to Vizzy Social Demo (unsafe)</strong>.
		</li>
	</ol>

	<p class="fallback">
		No access to our Google Cloud project? Send your Gmail address to your team admin — they'll add
		you in 30 seconds.
	</p>
</details>

<style>
	.guide {
		border: 1px solid #f4cccc;
		background: #fff5f5;
		border-radius: 8px;
		padding: 14px 18px;
		margin-top: 12px;
	}
	summary {
		cursor: pointer;
		font-weight: 600;
		font-size: 14px;
		color: #c1272d;
	}
	.why {
		margin: 8px 0 0;
		font-size: 13px;
		color: #555;
	}
	.primary-link {
		display: inline-block;
		margin: 14px 0 6px;
		padding: 10px 18px;
		background: #ff0033;
		color: white;
		text-decoration: none;
		border-radius: 6px;
		font-weight: 500;
		font-size: 13px;
	}
	.primary-link:hover {
		background: #d4002a;
	}
	.steps {
		margin: 10px 0 0;
		padding-left: 20px;
		font-size: 13px;
		line-height: 1.7;
	}
	.steps li {
		margin-bottom: 6px;
	}
	.fallback {
		margin-top: 14px;
		font-size: 12px;
		color: #666;
		padding-top: 10px;
		border-top: 1px solid #f0d0d0;
	}
</style>
