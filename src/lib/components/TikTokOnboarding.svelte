<script lang="ts">
	import { env } from '$env/dynamic/public';

	let { open = false }: { open?: boolean } = $props();

	// Exact TikTok sandbox "Target users" URL, configured per-deployment
	// (PUBLIC_TIKTOK_SANDBOX_URL). Clicking it lands the user at TikTok's login →
	// then this page once authed.
	const consoleUrl = env.PUBLIC_TIKTOK_SANDBOX_URL || 'https://developers.tiktok.com/';
</script>

<details class="guide" {open}>
	<summary>Need access? Add yourself as a TikTok Target user</summary>
	<p class="why">
		The app is in TikTok <strong>sandbox</strong> mode — only accounts on the
		<em>Target users</em> list (max 10) can connect.
	</p>

	<a class="primary-link" href={consoleUrl} target="_blank" rel="noopener">
		Open TikTok Sandbox console ↗
	</a>

	<ol class="steps">
		<li>Click the button above — TikTok will prompt you to log in, then land you on the sandbox page.</li>
		<li>
			Find <strong>Target users</strong> → click <strong>+ Add</strong> → enter your TikTok username
			(without the <code>@</code>) → Save.
		</li>
		<li>Come back here and click <strong>Connect TikTok</strong>.</li>
	</ol>

	<p class="fallback">
		No access to the TikTok developer console? Send your TikTok username to your team admin —
		they'll add you in 30 seconds.
	</p>
</details>

<style>
	.guide {
		border: 1px solid #d9c9a3;
		background: #fffaf0;
		border-radius: 8px;
		padding: 14px 18px;
		margin-top: 12px;
	}
	summary {
		cursor: pointer;
		font-weight: 600;
		font-size: 14px;
		color: #8a6d3b;
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
		background: #000;
		color: white;
		text-decoration: none;
		border-radius: 6px;
		font-weight: 500;
		font-size: 13px;
	}
	.primary-link:hover {
		background: #222;
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
		border-top: 1px solid #ead9b3;
	}
</style>
