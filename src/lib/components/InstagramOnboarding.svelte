<script lang="ts">
	import { env } from '$env/dynamic/public';

	let { open = false }: { open?: boolean } = $props();

	// Exact Meta App Roles URL, configured per-deployment (PUBLIC_INSTAGRAM_TESTERS_URL).
	// Clicking it lands the user at Meta's login → then this page once authed.
	const consoleUrl = env.PUBLIC_INSTAGRAM_TESTERS_URL || 'https://developers.facebook.com/apps/';
</script>

<details class="guide" {open}>
	<summary>Need access? Get added as an Instagram Tester</summary>
	<p class="why">
		The app is in development — only <strong>Business</strong> or <strong>Creator</strong> Instagram
		accounts added as an <em>Instagram Tester</em> can connect.
	</p>

	<a class="primary-link" href={consoleUrl} target="_blank" rel="noopener">
		Open Meta App Roles ↗
	</a>

	<ol class="steps">
		<li>
			Confirm your IG account is <strong>Business</strong> or <strong>Creator</strong> (Instagram app →
			Settings → <em>Account type and tools</em>).
		</li>
		<li>
			Click the button above — Meta will prompt you to log in, then land you on this app's
			<strong>Roles</strong> page. Find the <em>Instagram testers</em> section → click
			<strong>Add People</strong> → enter your IG username.
		</li>
		<li>
			<strong>Critical — accept the invite inside the Instagram app</strong>:
			Settings → <em>Apps and websites</em> → <strong>Tester invites</strong> → Accept.
			(Easy to miss; without this the connect will fail.)
		</li>
		<li>Come back here and click <strong>Connect Instagram</strong>.</li>
	</ol>

	<p class="fallback">
		No access to the Meta developer console? Send your IG <code>@handle</code> to your team admin —
		they'll add you in 30 seconds.
	</p>
</details>

<style>
	.guide {
		border: 1px solid #d9b9d0;
		background: #fdf5fb;
		border-radius: 8px;
		padding: 14px 18px;
		margin-top: 12px;
	}
	summary {
		cursor: pointer;
		font-weight: 600;
		font-size: 14px;
		color: #a3458f;
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
		background: linear-gradient(45deg, #f09433, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888);
		color: white;
		text-decoration: none;
		border-radius: 6px;
		font-weight: 500;
		font-size: 13px;
	}
	.primary-link:hover {
		filter: brightness(1.05);
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
		border-top: 1px solid #ead0e2;
	}
</style>
