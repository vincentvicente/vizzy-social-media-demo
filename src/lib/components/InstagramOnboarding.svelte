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
		This is an internal tool. To connect, your IG account needs to be added as an
		<em>Instagram Tester</em> on our Meta app, <strong>and then</strong> you accept the invite on
		your phone. Both sides are required.
	</p>

	<a class="primary-link" href={consoleUrl} target="_blank" rel="noopener">
		Open Meta App Roles ↗
	</a>

	<ol class="steps">
		<li>
			Your IG account must be <strong>Business</strong> or <strong>Creator</strong> (not Personal).
			Switch via Instagram app → Settings → <em>Account type and tools</em>.
		</li>
		<li>
			<strong>Add yourself in the Meta console</strong> — click the button above; Meta will prompt
			login then land you on our app's Roles page. Scroll to <em>Instagram testers</em> →
			<strong>Add People</strong> → enter your IG username (without <code>@</code>) → Save.
			<br /><em>(Skip this step if a team admin already added you.)</em>
		</li>
		<li>
			<strong>Accept the invite on your phone</strong> — open Instagram → Settings →
			<em>Apps and websites</em> → <strong>Tester invites</strong> → Accept the Vizzy invite.
			<br /><em>Critical: the OAuth fails without this step, even if step 2 is done.</em>
		</li>
		<li>Come back here and click <strong>Connect Instagram</strong>.</li>
	</ol>

	<p class="fallback">
		No access to our Meta developer console? Send your IG <code>@handle</code> to your team admin
		— they'll do step 2 for you in 30 seconds. <strong>You still need to do step 3 on your phone.</strong>
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
